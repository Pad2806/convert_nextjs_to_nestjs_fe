"use client";

import { useEffect, useState, useRef } from "react";
import { useBookingForm } from "./useBookingForm";
import {
  User,
  Phone,
  Building2,
  Stethoscope,
  Clock,
  Loader2,
  Users,
  Calendar,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { generateSepayQR } from "@/app/lib/payment/sepayqr";

interface Option {
  id: string;
  name: string;
}

interface TimeSlot {
  time: string;
  capacity: number;
  booked: number;
  available: number;
}

interface InputProps {
  label: string;
  value?: string;
  type?: string;
  icon?: React.ReactNode;
  error?: string;
  min?: string;
  onChange: (value: string) => void;
}

interface SelectOption {
  id: string;
  name: string;
}

interface SelectProps {
  label: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  icon?: React.ReactNode;
}
type BookingResponse = {
  id: string;
  status: "pending" | "paid" | "expired";
  amount: number;
  patientName: string;
  serviceName: string;
  clinicName: string;
};

export default function BookingForm() {
  const { form, update, submit, errors, isSubmitting, validateBookingAvailability, reset } = useBookingForm();
  const [clinics, setClinics] = useState<Option[]>([]);
  const [services, setServices] = useState<Option[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [hasCheckedSlots, setHasCheckedSlots] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = today.toLocaleDateString("en-CA");
  const datePickerRef = useRef<HTMLInputElement>(null);
  
  const [paymentBookingId, setPaymentBookingId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "expired">("pending");
  const [paymentCreatedAt, setPaymentCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentBookingId || paymentStatus === "paid" || paymentStatus === "expired") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/bookings/${paymentBookingId}`);
        const data = await res.json();
        
        if (data.created_at && !paymentCreatedAt) {
            setPaymentCreatedAt(data.created_at);
        }

        if (data.status === "paid") {
          setPaymentStatus("paid");
          clearInterval(interval);
        } else if (data.status === "expired") {
          setPaymentStatus("expired");
          clearInterval(interval);
        }
      } catch (e) {
        console.error(e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentBookingId, paymentStatus]);

  useEffect(() => {
    Promise.all([
      fetch("/api/clinics").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
    ]).then(([c, s]) => {
      setClinics(c);
      setServices(s);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!form.clinic || !form.service || !form.appointmentDate) {
      setHasCheckedSlots(false);
      return;
    }

    setHasCheckedSlots(false);
    fetch(
      `/api/available-slots?clinic_id=${form.clinic}&service_id=${form.service}&date=${form.appointmentDate}`,
      { cache: "no-store" }
    )
      .then((r) => r.json())
      .then((d: TimeSlot[]) => {
        let slots = d;
        const now = new Date();
        const isToday =
          form.appointmentDate === now.toLocaleDateString("en-CA");

        if (isToday) {
          const currentTime = now.toTimeString().slice(0, 5);
          slots = slots.filter((s) => s.time > currentTime);
        }

        setTimeSlots(slots);
        setHasCheckedSlots(true);
      });
  }, [form.clinic, form.service, form.appointmentDate]);

  // Helper to determine active date tab
  const getSelectedDateTab = () => {
    if (!form.appointmentDate) return null;
    const selected = new Date(form.appointmentDate);
    selected.setHours(0,0,0,0);
    const t = new Date();
    t.setHours(0,0,0,0);
    
    const diffTime = selected.getTime() - t.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays >= 0 && diffDays <= 2) return diffDays; // 0, 1, 2
    return "other";
  };
  
  const selectedTab = getSelectedDateTab();

  if (loading) {
    return (
      <div className="p-16 flex justify-center">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
      {/* SECTION 1: APPOINTMENT DETAILS */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center border-b pb-2">
          Nội dung chi tiết đặt hẹn
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            <Select
              label="Bệnh viện/phòng khám Vinmec *"
              icon={<Building2 />}
              value={form.clinic}
              options={clinics}
              error={errors.clinic}
              onChange={(v) => {
                update("clinic", v);
                update("service", "");
                update("appointmentDate", "");
                update("appointmentTime", "");
                setTimeSlots([]);
              }}
            />

            <Select
              label="Chuyên khoa *"
              icon={<Stethoscope />}
              value={form.service}
              options={services}
              disabled={!form.clinic}
              error={errors.service}
              onChange={(v) => {
                update("service", v);
                update("appointmentDate", "");
                update("appointmentTime", "");
                setTimeSlots([]);
              }}
            />

          </div>

          {/* Right Column: Time Selection */}
          <div className="space-y-4">
             <label className="text-sm font-medium block text-slate-900">Thời gian khám *</label>
             
             <div className="relative rounded-xl">
                 {/* Disable Overlay if Clinic/Service not selected */}
                 {(!form.clinic || !form.service) && (
                    <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl border border-dashed border-slate-300">
                        <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded shadow-sm border">
                            Vui lòng chọn Phòng khám & Chuyên khoa trước
                        </span>
                    </div>
                 )}

                 {/* Content Wrapper */}
                 <div className={`${(!form.clinic || !form.service) ? 'opacity-50 pointer-events-none' : ''} transition-opacity duration-200`}>
                     {/* Custom Date Picker Tabs */}
                     <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
                        {[0, 1, 2].map(offset => {
                            const d = new Date();
                            d.setDate(d.getDate() + offset);
                            const dateStr = d.toLocaleDateString("en-CA"); // YYYY-MM-DD
                            const displayDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}`;
                            
                            const weekdays = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
                            const realDayName = weekdays[d.getDay()];

                            const isSelected = selectedTab === offset;
                            
                            return (
                                <button 
                                    key={offset}
                                    onClick={() => {
                                        update("appointmentDate", dateStr);
                                        update("appointmentTime", "");
                                        setTimeSlots([]);
                                    }}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition min-w-[100px] ${
                                        isSelected 
                                        ? "bg-emerald-500 text-white border-emerald-500 shadow-md transform scale-105" 
                                        : "bg-gray-50 text-slate-600 border-slate-100 hover:border-emerald-200 hover:bg-white"
                                    }`}
                                >
                                    <span className="text-lg font-bold">{displayDate}</span>
                                    <span className="text-xs font-medium opacity-90">{realDayName}</span>
                                </button>
                            )
                        })}
                        <div className="relative">
                            <input 
                                ref={datePickerRef}
                                type="date" 
                                min={minDate}
                                className="sr-only"
                                onChange={(e) => {
                                     if(e.target.value) {
                                         update("appointmentDate", e.target.value);
                                         update("appointmentTime", "");
                                         setTimeSlots([]);
                                     }
                                }}
                            />
                            <button 
                                onClick={() => {
                                    if (datePickerRef.current) {
                                        try {
                                            datePickerRef.current.showPicker();
                                        } catch (e) {
                                            // Fallback for older browsers
                                            datePickerRef.current.click();
                                        }
                                    }
                                }}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition min-w-[100px] h-full ${
                                selectedTab === "other"
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-md" 
                                : "bg-gray-50 text-slate-600 border-slate-100 hover:border-emerald-200"
                            }`}>
                                {selectedTab === "other" && form.appointmentDate ? (
                                     <>
                                        <span className="text-lg font-bold">
                                            {form.appointmentDate.split('-').reverse().slice(0,2).join('/')}
                                        </span>
                                        <span className="text-xs font-medium flex items-center gap-1">
                                            Ngày khác <Calendar className="w-3 h-3" />
                                        </span>
                                     </>
                                ) : (
                                     <>
                                        <span className="text-lg font-bold">--/--</span>
                                        <span className="text-xs font-medium flex items-center gap-1">
                                            Ngày khác <Calendar className="w-3 h-3" />
                                        </span>
                                     </>
                                )}
                                
                            </button>
                         </div>
                     </div>

                     {/* Time Slots Grid */}
                     <div>
                        {timeSlots.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {timeSlots.map(s => (
                                    <button
                                        key={s.time}
                                        onClick={() => update("appointmentTime", s.time)}
                                        className={`py-2 px-1 text-sm rounded border transition ${
                                            form.appointmentTime === s.time
                                            ? "bg-blue-100 text-blue-700 border-blue-300 font-semibold"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                                        }`}
                                    >
                                        {s.time}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-lg text-center border border-dashed border-slate-200">
                                {form.appointmentDate ? "Đang tải hoặc không có giờ trống..." : "Vui lòng chọn ngày khám"}
                            </div>
                        )}
                        {errors.appointmentDate && <p className="text-sm text-red-600 mt-1">{errors.appointmentDate}</p>}
                        {errors.appointmentTime && <p className="text-sm text-red-600 mt-1">{errors.appointmentTime}</p>}

                        {hasCheckedSlots && timeSlots.length === 0 && form.appointmentDate && (
                            <div className="mt-2 text-sm text-orange-600">Đã hết lịch cho ngày này</div>
                        )}
                     </div>
                     
                     <p className="text-xs text-slate-500 italic mt-4">
                        *Lưu ý: Tổng đài viên sẽ gọi lại cho quý khách để xác nhận thông tin thời gian dựa theo đăng ký và điều chỉnh nếu cần thiết.
                     </p>
                 </div>
             </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CUSTOMER INFO */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center border-b pb-2">
          Thông tin khách hàng
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-4">
                {/* Name + Gender Row */}
                <div className="flex gap-4 items-start">
                    <div className="flex-1">
                       <label className="text-sm font-medium mb-1 block">Họ và tên *</label>
                       <input 
                           placeholder="Họ và tên"
                           value={form.name}
                           onChange={(e) => update("name", e.target.value)}
                           className={`w-full py-3 px-4 rounded-xl border ${errors.name ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-100 outline-none`}
                        />
                        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                    </div>
                    
                    <div>
                         <label className="text-sm font-medium mb-1 block">Giới tính *</label>
                         <div className="flex items-center gap-4 px-2 h-[50px]">
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="gender" 
                                    value="male"
                                    checked={form.gender === "male"} 
                                    onChange={() => update("gender", "male")}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm">Nam</span>
                             </label>
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="gender" 
                                    value="female"
                                    checked={form.gender === "female"} 
                                    onChange={() => update("gender", "female")}
                                    className="w-4 h-4 text-pink-500"
                                />
                                <span className="text-sm">Nữ</span>
                             </label>
                        </div>
                        {errors.gender && <p className="text-sm text-red-600 mt-1">{errors.gender}</p>}
                    </div>
                </div>

                <Input
                    label="Số điện thoại *"
                    placeholder="Nhập số điện thoại"
                    value={form.phone}
                    error={errors.phone}
                    onChange={(v) => update("phone", v)}
                />

            </div>

            {/* Right Column */}
            <div className="space-y-4">
                <Input
                    label="Tuổi *"
                    type="number"
                    placeholder="Nhập tuổi"
                    value={form.age}
                    error={errors.age}
                    onChange={(v) => update("age", v)}
                />
            </div>
        </div>
        
        <div className="mt-4">
             <TextArea
                label="Lý do khám"
                value={form.symptoms}
                error={errors.symptoms}
                onChange={(v) => update("symptoms", v)}
             />
        </div>
        
        <div className="mt-4">
            <div className="flex items-start gap-2">
                <input 
                    type="checkbox" 
                    id="consent" 
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={form.consent || false}
                    onChange={(e) => update("consent", e.target.checked)}
                />
                <label htmlFor="consent" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
                    Tôi đã đọc và đồng ý với <a href="#" className="text-blue-600 hover:underline">Chính sách bảo vệ dữ liệu cá nhân</a> và chấp thuận để xử lý dữ liệu cá nhân...
                </label>
            </div>
            {errors.consent && (
                <p className="text-sm text-red-600 mt-1 pl-6">Vui lòng đồng ý với điều khoản để tiếp tục</p>
            )}
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
            onClick={async () => {
            const isValid = await validateBookingAvailability();
            if (isValid) setShowModal(true);
            }}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl disabled:bg-slate-400 min-w-[200px]"
        >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Content Kept Same as Before but updated style if needed */}
             <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                Xác nhận thông tin
              </h3>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-blue-50 p-4 rounded-xl space-y-2 text-blue-900">
                <div className="flex justify-between">
                  <span className="text-blue-600">Bệnh nhân:</span>
                  <span className="font-medium">{form.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">SĐT:</span>
                  <span className="font-medium">{form.phone}</span>
                </div>
                 <div className="flex justify-between">
                  <span className="text-blue-600">Tuổi:</span>
                  <span className="font-medium">{form.age ? form.age : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Phòng khám:</span>
                  <span className="font-medium">
                    {clinics.find((c) => c.id === form.clinic)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Dịch vụ:</span>
                  <span className="font-medium">
                    {services.find((s) => s.id === form.service)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Thời gian:</span>
                  <span className="font-medium">
                    {form.appointmentTime} -{" "}
                    {form.appointmentDate?.split("-").reverse().join("/")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-blue-200 rounded-xl bg-white shadow-sm">
                <span className="text-slate-600 font-medium">
                  Tiền đặt cọc
                </span>
                <span className="text-lg font-bold text-blue-600">
                  2.000 đ
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                   const bookingId = await submit();
                   if (bookingId) {
                       setShowModal(false);
                       setPaymentBookingId(bookingId);
                       setPaymentStatus("pending");
                   }
                }}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-slate-400 transition"
              >
                {isSubmitting ? "Đang xử lý..." : "Thanh toán"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment QR Modal */}
      {paymentBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] p-6 shadow-2xl max-w-sm w-full relative animate-in zoom-in-95 duration-200 border border-slate-100">
               {paymentStatus === "pending" && (
                   /* Pending State */
                   <>
                        <button 
                            onClick={async () => {
                                if (paymentBookingId) {
                                    await fetch(`/api/bookings/${paymentBookingId}`, {
                                        method: 'PATCH',
                                        body: JSON.stringify({ status: 'expired' })
                                    });
                                }
                                setPaymentBookingId(null);
                                setPaymentStatus("pending");
                                setPaymentCreatedAt(null);
                                reset();
                                setHasCheckedSlots(false);
                                setTimeSlots([]);
                            }}
                            className="absolute right-4 top-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="text-center space-y-4 pt-2">
                             <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-2">
                                <FileText />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Thanh toán giữ lịch</h3>
                            <p className="text-slate-500 text-sm px-4">
                                Quét mã QR để hoàn tất đặt lịch
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
                   </>
               )}

               {paymentStatus === "paid" && (
                   /* Success State */
                   <div className="text-center space-y-6 pt-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-2 animate-in zoom-in duration-300">
                             <CheckCircle2 size={48} strokeWidth={3} />
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-slate-900">Thanh toán thành công!</h3>
                            <p className="text-slate-500">Lịch khám của bạn đã được xác nhận</p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Mã đặt lịch</span>
                                <span className="font-bold text-slate-900">#{paymentBookingId?.slice(0, 8)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Trạng thái</span>
                                <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Đã thanh toán</span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setPaymentBookingId(null);
                                setPaymentStatus("pending");
                                setPaymentCreatedAt(null);
                                reset();
                                setHasCheckedSlots(false);
                                setTimeSlots([]);
                            }}
                            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                        >
                            Hoàn tất
                        </button>
                   </div>
               )}

               {paymentStatus === "expired" && (
                   /* Expired State */
                   <div className="text-center space-y-6 pt-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600 mb-2 animate-in zoom-in duration-300">
                             <AlertCircle size={48} strokeWidth={3} />
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-slate-900">Hết thời gian thanh toán</h3>
                            <p className="text-slate-500">Vui lòng thực hiện lại quy trình đặt lịch</p>
                        </div>
                        
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm space-y-2">
                             <div className="flex justify-between">
                                <span className="text-slate-500">Mã đặt lịch</span>
                                <span className="font-bold text-slate-900">#{paymentBookingId?.slice(0, 8)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Trạng thái</span>
                                <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">Đã hết hạn</span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setPaymentBookingId(null);
                                setPaymentStatus("pending");
                                setPaymentCreatedAt(null);
                                reset();
                                setHasCheckedSlots(false);
                                setTimeSlots([]);
                            }}
                            className="w-full py-3.5 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition shadow-lg"
                        >
                            Đóng & Tạo lại
                        </button>
                   </div>
               )}
           </div>
        </div>
      )}
    </div>
  );
}

// Helper Inputs 
function Input({
  label,
  value,
  type = "text",
  placeholder,
  icon,
  error,
  min,
  onChange,
}: InputProps & { placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-3 text-slate-400">{icon}</span>}
        <input
          type={type}
          value={value ?? ""}
          min={min}
          placeholder={placeholder}
          onChange={(e) => {
            const val = e.target.value;
            // If label implies phone number, restricted to digits only
            if (label.toLowerCase().includes("điện thoại") || label.toLowerCase().includes("phone")) {
                if (/^\d*$/.test(val)) {
                    onChange(val);
                }
            } else {
                onChange(val);
            }
          }}
          className={`w-full py-3 rounded-xl border ${
            icon ? "pl-10" : "pl-4"
          } ${error ? "border-red-500 hover:border-red-500" : "border-slate-300 hover:border-blue-400"} transition focus:ring-2 focus:ring-blue-100 outline-none`}
        />
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
  disabled,
  error,
  icon,
}: SelectProps) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="relative mt-1">
        {icon && <span className="absolute left-3 top-3">{icon}</span>}
        <select
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full py-3 rounded-xl border ${
            icon ? "pl-10" : "pl-4"
          } ${
            error ? "border-red-500" : "border-slate-300"
          } disabled:bg-slate-100`}
        >
          <option value="">Chọn</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function TextArea({
  label,
  value,
  icon,
  error,
  onChange,
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="relative mt-1">
        {icon && <span className="absolute left-3 top-3">{icon}</span>}
        <textarea
          rows={3}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full py-3 rounded-xl border ${
            icon ? "pl-10" : "pl-4"
          } ${error ? "border-red-500" : "border-slate-300"}`}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function PaymentCountdown({ createdAt }: { createdAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  
  useEffect(() => {
    // Immediate calculation
    const calc = () => {
        // Ensure UTC if needed, similar to server logic
        const timeStr = createdAt.endsWith("Z") ? createdAt : createdAt + "Z";
        const start = new Date(timeStr).getTime();
        const expire = start + 5 * 60 * 1000; // 5 minutes
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
