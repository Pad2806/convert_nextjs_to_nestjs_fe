"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/app/lib/supabase/client";
import { Clinic } from "@/app/lib/supabase/types/clinic";
import { Service } from "@/app/lib/supabase/types/service";
import { useRouter } from "next/navigation";
import { generateSepayQR } from "@/app/lib/payment/sepayqr";
import { X } from "lucide-react";

type SlotStat = {
  time: string;
  capacity: number;
  booked: number;
  available: number;
};

type ChatStep =
  | "name"
  | "phone"
  | "symptoms"
  | "gender"
  | "age"
  | "clinic"
  | "service"
  | "date"
  | "time"
  | "confirm"
  | "resolve_duplicate_phone";

interface BookingFormState {
  clinic?: string;
  service?: string;
  name: string;
  phone: string;
  time: string;
  symptoms: string;
  gender: boolean;
  age?: number;
}

interface Message {
  from: "bot" | "user";
  text: string;
  type?: "text" | "confirmation";
  bookingData?: BookingFormState & {
    clinicName: string;
    serviceName: string;
    amount: number;
  };
}

export default function ChatClient() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Xin chào! Bạn vui lòng cho biết Họ và tên?" },
  ]);

  const [step, setStep] = useState<ChatStep>("name");
  const [input, setInput] = useState("");

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<SlotStat[]>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDay, setTempDay] = useState("");
  const datePickerRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<BookingFormState>({
    name: "",
    phone: "",
    time: "",
    symptoms: "",
    gender: true,
  });

  const [paymentBookingId, setPaymentBookingId] = useState<string | null>(null);
  const [paymentCreatedAt, setPaymentCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentBookingId) return;

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/bookings/${paymentBookingId}`);
        const data = await res.json();
        
        if (data.created_at && !paymentCreatedAt) {
            setPaymentCreatedAt(data.created_at);
        }

        if (data.status === "paid") {
          setPaymentBookingId(null);
          pushBot("Thanh toán thành công! Lịch hẹn của bạn đã được xác nhận.");
        } else if (data.status === "expired") {
          setPaymentBookingId(null);
          setPaymentCreatedAt(null);
          pushBot("Giao dịch đã hết hạn. Vui lòng chọn lại thời gian khám.");
          setStep("date");
          setShowDatePicker(true);
        }
      } catch (error) {
        console.error("Payment check error:", error);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [paymentBookingId]);


  const pushBot = (text: string) =>
    setMessages((prev) => [...prev, { from: "bot", text }]);

  useEffect(() => {
    const init = async () => {
      const { data: c } = await supabase
        .from("clinics")
        .select("id, name, address, email");

      setClinics(c || []);

      const { data: s } = await supabase.from("services").select("id, name");

      setServices(s || []);
    };

    init();
  }, []);

  const askNext = (current: ChatStep) => {
    switch (current) {
      case "name":
        setStep("phone");
        pushBot("Số điện thoại của bạn? (10 số)");
        break;

      case "phone":
        setStep("symptoms");
        pushBot("Bạn có triệu chứng gì cần khám?");
        break;

      case "symptoms":
        setStep("gender");
        pushBot("Giới tính của bạn?\n1. Nam\n2. Nữ");
        break;

      case "gender":
        setStep("age");
        pushBot("Tuổi của bạn?");
        break;

      case "age":
        setStep("clinic");
        pushBot("Bạn muốn đặt lịch tại phòng khám nào?\n" + clinics.map((c, i) => `${i + 1}. ${c.name}`).join("\n"));
        break;

      case "clinic":
        setStep("service");
        pushBot("Bạn muốn sử dụng dịch vụ nào?\n" + services.map((s, i) => `${i + 1}. ${s.name}`).join("\n"));
        break;

      case "service":
        setStep("date");
        setShowDatePicker(true);
        break;

      default:
        break;
    }
  };

  const createBookingViaApi = async (bookingTime: string) => {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        gender: form.gender ? "male" : "female",
        age: form.age,
        symptoms: form.symptoms,
        clinic: form.clinic,
        service: form.service,
        booking_time: bookingTime,
        amount: 2000,
      }),
    });

    if (!res.ok) return null;

    const data: { bookingId: string } = await res.json();
    return data.bookingId;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: input }]);

    switch (step) {
      case "name":
        setForm({ ...form, name: input });
        askNext("name");
        break;

      case "phone": {
        if (!/^\d{10}$/.test(input)) {
          pushBot("Số điện thoại không hợp lệ.");
          break;
        }
        setForm({ ...form, phone: input });
        askNext("phone");
        break;
      }

      case "symptoms":
        setForm({ ...form, symptoms: input });
        askNext("symptoms");
        break;

      case "gender":
        if (input !== "1" && input !== "2") {
          pushBot("Vui lòng chọn 1 hoặc 2.");
          break;
        }
        setForm({ ...form, gender: input === "1" });
        askNext("gender");
        break;

      case "age": {
        const age = Number(input);
        if (!Number.isInteger(age) || age <= 0) {
          pushBot("Tuổi không hợp lệ.");
          break;
        }
        setForm({ ...form, age });
        askNext("age");
        break;
      }

      case "clinic": {
        const idx = Number(input) - 1;
        if (!clinics[idx]) {
          pushBot("Vui lòng chọn số hợp lệ.");
          break;
        }
        setForm({ ...form, clinic: clinics[idx].id });
        askNext("clinic");
        break;
      }

      case "service": {
        const idx = Number(input) - 1;
        if (!services[idx]) {
          pushBot("Vui lòng chọn số hợp lệ.");
          break;
        }
        setForm({ ...form, service: services[idx].id });
        askNext("service");
        break;
      }

      case "resolve_duplicate_phone": {
        if (!/^\d{10}$/.test(input)) {
          pushBot("Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số.");
          break;
        }
        setForm({ ...form, phone: input });
        pushBot(`Đã cập nhật số điện thoại: ${input}`);
        pushBot("Vui lòng chọn lại thời gian khám:");
        setStep("date");
        setShowDatePicker(true);
        break;
      }

      case "time": {
        const idx = Number(input) - 1;
        if (!slots[idx]) {
          pushBot("Vui lòng chọn giờ hợp lệ.");
          break;
        }

        try {
          const res = await fetch("/api/bookings/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: form.phone,
              appointmentDate: tempDay,
            }),
          });

          if (!res.ok) {
            const data = await res.json();
            pushBot(data.error || "Số điện thoại này đã có lịch hẹn trong ngày.");
            pushBot("Vui lòng chọn ngày khác:");
            setStep("date");
            setShowDatePicker(true);
            break;
          }
        } catch (error) {
          console.error("Validation error:", error);
          pushBot("Có lỗi xảy ra khi kiểm tra thông tin. Vui lòng thử lại.");
          break;
        }

        const bookingTime = `${tempDay} ${slots[idx].time}:00`;
        const clinicName = clinics.find((c) => c.id === form.clinic)?.name || "";
        const serviceName = services.find((s) => s.id === form.service)?.name || "";

        setForm((prev) => ({ ...prev, time: bookingTime }));
        setStep("confirm");

        setMessages((prev) => [
          ...prev,
          {
            from: "user",
            text: input,
          },
          {
            from: "bot",
            text: "Vui lòng xác nhận thông tin đặt lịch:",
            type: "confirmation",
            bookingData: {
              ...form,
              time: bookingTime,
              clinicName,
              serviceName,
              amount: 2000,
            },
          },
        ]);

        break;
      }
    }

    setInput("");
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper logic for dates
  const getDayLabel = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dateStr = d.toLocaleDateString("en-CA");
    const displayDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}`;
    const weekdays = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return { dateStr, displayDate, label: weekdays[d.getDay()] };
  };

  const todayStr = new Date().toLocaleDateString("en-CA");
  
  // Effect to fetch slots whenever tempDay changes and we are in date/time selection mode
  useEffect(() => {
    if (step === 'date' && tempDay && form.clinic && form.service) {
        setSlots([]);
        fetch(`/api/available-slots?clinic_id=${form.clinic}&service_id=${form.service}&date=${tempDay}`)
            .then(r => r.json())
            .then((data: SlotStat[]) => {
                 let s = data;
                 // If today, filter past times
                 if (tempDay === new Date().toLocaleDateString("en-CA")) {
                     const now = new Date();
                     const currentTime = now.toTimeString().slice(0, 5);
                     s = s.filter(slot => slot.time > currentTime);
                 }
                 setSlots(s);

                 if (s.length === 0) {
                     pushBot(`Rất tiếc, ngày ${tempDay.split('-').reverse().join('/')} đã kín lịch hoặc không có giờ khám. Vui lòng chọn ngày khác.`);
                 }
            })
            .catch(err => console.error(err));
    }
  }, [tempDay, step, form.clinic, form.service]);

  // When opening date picker, default to today
  useEffect(() => {
      if (showDatePicker && !tempDay) {
          setTempDay(new Date().toLocaleDateString("en-CA"));
      }
  }, [showDatePicker]);

  const handleTimeSelect = async (time: string) => {
      setShowDatePicker(false);
      // Manually trigger the flow as if user typed the time
      setMessages(prev => [...prev, { from: "user", text: `Đặt lịch lúc ${time} ngày ${tempDay.split('-').reverse().join('/')}` }]);
      
      const fullTime = `${tempDay} ${time}:00`;
      
      // Validate
       try {
          const res = await fetch("/api/bookings/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: form.phone,
              appointmentDate: tempDay,
            }),
          });

          if (!res.ok) {
            const data = await res.json();
            pushBot(data.error || "Số điện thoại này đã có lịch hẹn trong ngày.");
            pushBot("Vui lòng nhập số điện thoại khác để tiếp tục:");
            // Switch to a mode where we accept a new phone number
            setStep("resolve_duplicate_phone" as ChatStep); 
            return;
          }
        } catch (error) {
          console.error("Validation error:", error);
          pushBot("Có lỗi xảy ra khi kiểm tra thông tin. Vui lòng thử lại.");
          return;
        }

        const clinicName = clinics.find((c) => c.id === form.clinic)?.name || "";
        const serviceName = services.find((s) => s.id === form.service)?.name || "";
        
        setForm((prev) => ({ ...prev, time: fullTime }));
        setStep("confirm");

        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "Vui lòng xác nhận thông tin đặt lịch:",
            type: "confirmation",
            bookingData: {
              ...form,
              time: fullTime,
              clinicName,
              serviceName,
              amount: 2000,
            },
          },
        ]);
  };


  return (
    <div className="h-[calc(100vh-5rem)] w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-slate-50 p-2 font-sans">
      <div className="max-w-7xl w-full h-full bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100 ring-4 ring-white/50 backdrop-blur-xl">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between shadow-sm relative z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-800">Trợ lý ảo Thiện Nhân</h2>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-xs text-slate-500 font-medium">Đang hoạt động</p>
                </div>
            </div>
          </div>
          <div className="hidden sm:block">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  Hỗ trợ đặt lịch 24/7
              </span>
          </div>
        </div>

        {/* Messages Area */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50 scroll-smooth">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex w-full group ${
                m.from === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className={`flex max-w-[85%] sm:max-w-[75%] ${m.from === "user" ? "flex-row-reverse" : "flex-row"} gap-4`}>
                  
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white ${m.from === "user" ? "bg-indigo-100 text-indigo-600" : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"}`}>
                        {m.from === "user" ? (
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                        )}
                  </div>

                  {/* Bubble */}
                  <div className="space-y-1">
                      <div className={`flex items-center gap-2 text-xs text-slate-400 font-medium ${m.from === "user" ? "justify-end" : "justify-start ml-1"}`}>
                          {m.from === "user" ? "Bạn" : "Trợ lý"}
                      </div>
                      <div
                        className={`px-6 py-4 rounded-2xl text-[15px] leading-relaxed shadow-sm transition-all
                        ${
                          m.from === "user"
                            ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-200"
                            : "bg-white text-slate-700 border border-slate-200/60 rounded-tl-none shadow-slate-100"
                        }`}
                      >
                            {m.type === "confirmation" && m.bookingData ? (
                            <div className="w-full sm:w-[340px] bg-white rounded-xl p-0.5">
                                <div className="bg-slate-50/50 rounded-lg p-0 space-y-4">
                                    {/* Header */}
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200 mb-2">
                                        <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.78 2 2 0 0 1 0-2.83Z"/><path d="m9 12 2 2 4-4"/></svg>
                                        </div>
                                        <h3 className="font-bold text-slate-800">Xác nhận thông tin</h3>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                                            <span className="text-slate-500">Bệnh nhân</span>
                                            <span className="font-semibold text-slate-900 text-right">{m.bookingData.name}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                                            <span className="text-slate-500">Tuổi</span>
                                            <span className="font-semibold text-slate-900 text-right">{m.bookingData.age}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                                            <span className="text-slate-500">Số điện thoại</span>
                                            <span className="font-semibold text-slate-900 text-right">{m.bookingData.phone}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                                            <span className="text-slate-500">Phòng khám</span>
                                            <span className="font-semibold text-slate-900 text-right max-w-[60%] truncate">{m.bookingData.clinicName}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                                            <span className="text-slate-500">Dịch vụ</span>
                                            <span className="font-semibold text-slate-900 text-right max-w-[60%] truncate">{m.bookingData.serviceName}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                                            <span className="text-slate-500">Thời gian</span>
                                            <span className="text-blue-700 font-bold">
                                                {(() => {
                                                    const d = new Date(m.bookingData.time);
                                                    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} - ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                                                })()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-slate-600 font-medium">Tiền cọc</span>
                                        <span className="text-xl font-bold text-blue-600">{m.bookingData.amount.toLocaleString()} đ</span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                onClick={async () => {
                                    pushBot("Đang xử lý...");
                                    const bookingId = await createBookingViaApi(m.bookingData!.time);
                                    if (bookingId) {
                                        setPaymentBookingId(bookingId);
                                    } else {
                                        pushBot("Đặt lịch thất bại. Vui lòng thử lại.");
                                    }
                                }}
                                className="mt-4 w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <span>Đặt lịch & Thanh toán</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                </button>
                            </div>
                            ) : (
                            <div className="whitespace-pre-line">{m.text}</div>
                            )}
                      </div>
                  </div>
              </div>
            </div>
          ))}
        </div>

        {/* Date & Time Picker Area */}
        {showDatePicker && (
          <div className="border-t border-slate-100 z-10 px-6 py-5 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom duration-300">
             <div className="flex items-center gap-2 mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                 <label className="text-base font-bold text-slate-800">Chọn thời gian khám</label>
             </div>
             
             {/* Tabs */}
             <div className="flex gap-3 mb-5 overflow-x-auto pb-2 scrollbar-hide">
                {[0, 1, 2].map(offset => {
                    const { dateStr, displayDate, label } = getDayLabel(offset);
                    const isSelected = tempDay === dateStr;
                    return (
                        <button 
                            key={offset}
                            onClick={() => setTempDay(dateStr)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition min-w-[100px] flex-1 ${
                                isSelected 
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200" 
                                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                            }`}
                        >
                            <span className="text-lg font-bold">{displayDate}</span>
                            <span className={`text-xs font-medium ${isSelected ? "text-indigo-100" : "text-slate-400"}`}>{label}</span>
                        </button>
                    )
                })}
                 <div className="relative flex-1 min-w-[100px]">
                    <input 
                        ref={datePickerRef}
                        type="date" 
                        min={todayStr}
                        className="sr-only"
                        onChange={(e) => setTempDay(e.target.value)}
                    />
                    <button 
                        onClick={() => {
                            if (datePickerRef.current) {
                                try {
                                    datePickerRef.current.showPicker();
                                } catch (e) {
                                    datePickerRef.current.click();
                                }
                            }
                        }}
                        className={`w-full h-full flex flex-col items-center justify-center p-3 rounded-xl border transition ${
                            ![0, 1, 2].map(o => getDayLabel(o).dateStr).includes(tempDay) && tempDay
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg" 
                            : "bg-white text-slate-600 border-slate-200 hover:border-indigo-200"
                        }`}
                    >
                        {![0, 1, 2].map(o => getDayLabel(o).dateStr).includes(tempDay) && tempDay ? (
                              <>
                                <span className="text-lg font-bold">
                                    {tempDay.split('-').reverse().slice(0,2).join('/')}
                                </span>
                                <span className="text-xs font-medium opacity-90">Ngày khác</span>
                              </>
                        ) : (
                             <>
                                <span className="text-lg font-bold">--/--</span>
                                <span className="text-xs font-medium text-slate-400">Ngày khác</span>
                             </>
                        )}
                    </button>
                 </div>
             </div>

             {/* Slots Grid */}
             <div>
                {slots.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                        {slots.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleTimeSelect(s.time)}
                                className="py-2.5 px-2 bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 text-slate-700 rounded-lg text-sm font-semibold transition shadow-sm"
                            >
                                {s.time}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        <span className="text-sm">Không có lịch trống hoặc đang tải...</span>
                    </div>
                )}
             </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
             <div className="flex gap-2 items-center bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                <input
                    className="flex-1 bg-transparent border-none px-5 py-3 focus:ring-0 outline-none text-slate-700 placeholder:text-slate-400 font-medium disabled:opacity-50"
                    placeholder={showDatePicker ? "Vui lòng chọn thời gian ở trên..." : "Nhập câu trả lời của bạn..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    autoFocus
                    disabled={showDatePicker} // Disable typing if picking date
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white p-3.5 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95 flex-shrink-0"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
             </div>
             <p className="text-center text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-wide opacity-70">
                Trợ lý tư vấn tự động • Thông tin của bạn được bảo mật
             </p>
        </div>
      </div>

      {/* Payment QR Modal */}
      {paymentBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] p-6 shadow-2xl max-w-sm w-full relative animate-in zoom-in-95 duration-200 border border-slate-100">
                <button 
                    onClick={async () => {
                        if (paymentBookingId) {
                            await fetch(`/api/bookings/${paymentBookingId}`, {
                                method: 'PATCH',
                                body: JSON.stringify({ status: 'expired' })
                            });
                        }
                        setPaymentBookingId(null);
                        setPaymentCreatedAt(null);
                        pushBot("Bạn đã huỷ thanh toán. Vui lòng chọn lại thời gian khám nếu muốn đặt lại.");
                        setStep("date");
                        setShowDatePicker(true);
                    }}
                    className="absolute right-4 top-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition"
                >
                    <X size={20} />
                </button>

                <div className="text-center space-y-4 pt-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800">Thanh toán giữ lịch</h3>
                    <p className="text-slate-500 text-sm px-4">
                        Vui lòng quét mã QR bên dưới để hoàn tất đặt lịch
                    </p>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block">
                        <img 
                            src={generateSepayQR({
                                bankCode: "TPB",
                                accountNo: "23238628888",
                                amount: 2000,
                                description: `DATLICH_${paymentBookingId}`,
                            })} 
                            alt="QR Code" 
                            className="w-48 h-48 sm:w-56 sm:h-56 object-contain mix-blend-multiply"
                        />
                    </div>

                    <div className="space-y-2 text-sm bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Số tiền:</span>
                            <span className="font-bold text-blue-600 text-lg">2.000 đ</span>
                        </div>
                        <div className="flex justify-between items-baseline text-left">
                            <span className="text-slate-500 shrink-0 mr-2">Nội dung:</span>
                            <span className="font-mono font-bold text-slate-700 break-all">DATLICH_{paymentBookingId}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 py-2 rounded-lg">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Đang chờ thanh toán...
                    </div>
                     {paymentCreatedAt && <PaymentCountdown createdAt={paymentCreatedAt} />}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

function PaymentCountdown({ createdAt }: { createdAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  
  useEffect(() => {
    const calc = () => {
        const timeStr = createdAt.endsWith("Z") ? createdAt : createdAt + "Z";
        const start = new Date(timeStr).getTime();
        const expire = start + 5 * 60 * 1000;
        const now = Date.now();
        const diff = Math.max(0, expire - now);
        
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        
        setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
    };
    calc();

    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [createdAt]);

  if (!timeLeft) return null;
  
  return <div className="text-center mt-2 animate-in fade-in slide-in-from-top-1"><span className="text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 shadow-sm">Thanh toán trong: {timeLeft}</span></div>;
}
