// "use client";
// import { useEffect, useState } from "react";
// import { supabase } from "@/app/lib/supabase/client";
// import { Clinic } from "@/app/lib/supabase/types/clinic";
// import { Service } from "@/app/lib/supabase/types/service";
// import { useRouter } from "next/navigation";

// type SlotStat = {
//   time: string;
//   capacity: number;
//   booked: number;
//   available: number;
// };

// interface BookingFormState {
//   clinic?: string;
//   service?: string;
//   name: string;
//   phone: string;
//   time: string;
//   symptoms: string;
//   gender: boolean;
//   age?: number;
// }

// interface Message {
//   from: "bot" | "user";
//   text: string;
// }

// export default function ChatPage() {
//   const [messages, setMessages] = useState<Message[]>([
//     { from: "bot", text: "Xin chào! Bạn vui lòng cho biết Họ và tên?" },
//   ]);

//   const router = useRouter();
//   const [userId, setUserId] = useState<string | null>(null);

//   const [input, setInput] = useState("");
//   const [step, setStep] = useState<keyof BookingFormState>("name");
//   // const [step, setStep] = useState<
//   //   keyof BookingFormState | "confirm"
//   // >("name");
//   const [tempDay, setTempDay] = useState("");
//   const [slots, setSlots] = useState<SlotStat[]>([]);
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const [clinics, setClinics] = useState<Clinic[]>([]);
//   const [services, setServices] = useState<Service[]>([]);

//   const [form, setForm] = useState<BookingFormState>({
//     name: "",
//     phone: "",
//     time: "",
//     symptoms: "",
//     gender: true,
//   });

//   const insertBooking = async (bookingTime: string) => {
//     if (!form.clinic || !form.service || !bookingTime) {
//       pushBot("Thiếu thông tin đặt lịch");
//       return false;
//     }

//     const { error } = await supabase.from("bookings").insert({
//       user_id: userId, // lấy từ session
//       clinic_id: form.clinic,
//       service_id: form.service,
//       patient_name: form.name,
//       patient_phone: form.phone,
//       gender: form.gender ? "male" : "female",
//       age: form.age,
//       symptoms: form.symptoms,
//       booking_time: bookingTime, // DÙNG PARAM
//       status: "pending",
//     });

//     if (error) {
//       console.error("Insert booking error:", error);
//       pushBot("Đặt lịch thất bại, vui lòng thử lại");
//       return false;
//     }

//     return true;
//   };

//   useEffect(() => {
//     const fetchClinics = async () => {
//       const { data, error } = await supabase
//         .from("clinics")
//         .select("id, name, address, email");

//       if (error) {
//         console.error("Fetch clinics error:", error);
//         return;
//       }

//       setClinics(data || []);
//     };

//     const fetchServices = async () => {
//       const { data, error } = await supabase
//         .from("services")
//         .select("id, name");

//       if (!error) setServices(data || []);
//     };

//     const fetchSession = async () => {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();

//       setUserId(session?.user?.id ?? null);
//     };

//     fetchSession();
//     fetchServices();
//     fetchClinics();
//   }, []);

//   const askNext = (current: keyof BookingFormState) => {
//     switch (current) {
//       case "name":
//         setStep("phone");
//         pushBot("Số điện thoại của bạn? (10 số)");
//         break;

//       case "phone":
//         setStep("symptoms");
//         pushBot("Bạn có triệu chứng gì cần khám?");
//         break;

//       case "symptoms":
//         setStep("gender");
//         pushBot("Giới tính của bạn? (chọn số)");
//         pushBot("1. Nam\n2. Nữ");
//         break;

//       case "gender":
//         setStep("age");
//         pushBot("Tuổi của bạn?");
//         break;

//       case "age":
//         setStep("clinic");
//         pushBot("Bạn muốn đặt lịch tại phòng khám nào? (chọn số)");
//         pushBot(clinics.map((c, i) => `${i + 1}. ${c.name}`).join("\n"));
//         break;

//       case "clinic":
//         setStep("service");
//         pushBot("Bạn muốn sử dụng dịch vụ nào? (chọn số)");
//         pushBot(services.map((s, i) => `${i + 1}. ${s.name}`).join("\n"));
//         break;

//       case "service":
//         setStep("time");
//         pushBot("Vui lòng chọn ngày khám từ lịch bên dưới:");
//         setShowDatePicker(true);
//         break;

//       case "time":
//         break;
//     }
//   };

//   const pushBot = (text: string) => {
//     setMessages((prev) => [...prev, { from: "bot", text }]);
//   };

//   const handleSend = () => {
//     if (!input.trim()) return;

//     setMessages((prev) => [...prev, { from: "user", text: input }]);

//     switch (step) {
//       case "name":
//         setForm({ ...form, name: input });
//         askNext("name");
//         break;

//       case "phone": {
//         const phone = input.trim();

//         const phoneRegex = /^\d{10}$/;

//         if (!phoneRegex.test(phone)) {
//           pushBot("Số điện thoại không hợp lệ.");
//           pushBot("Vui lòng nhập đúng 10 chữ số (ví dụ: 0987654321).");
//           break;
//         }

//         setForm({ ...form, phone });
//         askNext("phone");
//         break;
//       }

//       case "symptoms":
//         setForm({ ...form, symptoms: input });
//         askNext("symptoms");
//         break;

//       case "gender": {
//         if (input !== "1" && input !== "2") {
//           pushBot("Vui lòng chọn số hợp lệ.");
//           pushBot("1. Nam\n2. Nữ");
//           break;
//         }

//         setForm({ ...form, gender: input === "1" });
//         askNext("gender");
//         break;
//       }

//       case "age": {
//         const age = Number(input);

//         if (!Number.isInteger(age) || age <= 0 || age > 120) {
//           pushBot(
//             "Tuổi không hợp lệ. Vui lòng nhập số tuổi hợp lệ (ví dụ: 18)."
//           );
//           break;
//         }

//         setForm({ ...form, age });
//         askNext("age");
//         break;
//       }

//       case "clinic": {
//         const idx = Number(input) - 1;
//         if (!clinics[idx]) {
//           pushBot("Vui lòng chọn số hợp lệ.");
//           break;
//         }
//         setForm({ ...form, clinic: clinics[idx].id });
//         askNext("clinic");
//         break;
//       }

//       case "service": {
//         const idx = Number(input) - 1;
//         if (!services[idx]) {
//           pushBot("Vui lòng chọn số hợp lệ.");
//           break;
//         }

//         setForm({ ...form, service: services[idx].id });
//         askNext("service");
//         break;
//       }

//       case "time": {
//         const idx = Number(input) - 1;
//         if (!slots[idx]) {
//           pushBot("Vui lòng chọn số hợp lệ.");
//           break;
//         }

//         const selectedTime = slots[idx].time;
//         const fullDateTime = `${tempDay} ${selectedTime}:00`;

//         setForm((prev) => ({ ...prev, time: fullDateTime }));

//         (async () => {
//           pushBot("Đang lưu lịch khám...");

//           const ok = await insertBooking(fullDateTime);

//           if (ok) {
//             pushBot("Đặt lịch thành công!");
//             pushBot("Đang chuyển về trang chủ...");

//             setTimeout(() => {
//               router.push("/");
//             }, 1500);
//           }
//         })();

//         break;
//       }
//     }
//     setInput("");
//   };

//   return (
//     <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
//       <div className="max-w-2xl w-full h-[700px] bg-white rounded-3xl shadow flex flex-col">
//         <div className="bg-blue-600 text-white px-6 py-4 rounded-t-3xl">
//           <h2 className="text-lg font-semibold">Chat đặt lịch khám</h2>
//         </div>

//         <div className="flex-1 overflow-y-auto p-6 space-y-4">
//           {messages.map((m, i) => (
//             <div
//               key={i}
//               className={`flex ${
//                 m.from === "user" ? "justify-end" : "justify-start"
//               }`}
//             >
//               <div
//                 className={`px-4 py-2 rounded-xl text-sm whitespace-pre-line max-w-[80%]
//                 ${
//                   m.from === "user"
//                     ? "bg-blue-600 text-white"
//                     : "bg-gray-100 text-slate-800"
//                 }`}
//               >
//                 {m.text}
//               </div>
//             </div>
//           ))}
//         </div>
//         {showDatePicker && (
//           <div className="border-t px-4 py-3 bg-gray-50 space-y-3">
//             <label className="text-sm font-medium text-gray-700">
//               Chọn ngày khám
//             </label>

//             <input
//               type="date"
//               className="w-full border rounded-xl px-4 py-2"
//               min={new Date().toISOString().split("T")[0]}
//               onChange={async (e) => {
//                 const date = e.target.value;
//                 setTempDay(date);
//                 setShowDatePicker(false);

//                 pushBot(`Ngày khám: ${date}`);
//                 pushBot("Đang kiểm tra giờ trống...");

//                 const res = await fetch(
//                   `/api/available-slots?clinic_id=${form.clinic}&service_id=${form.service}&date=${date}`
//                 );
//                 const data: SlotStat[] = await res.json();

//                 if (!data.length) {
//                   pushBot("Ngày này đã kín lịch");
//                   pushBot("Vui lòng chọn ngày khác.");

//                   // cho phép chọn lại ngày
//                   setShowDatePicker(true);
//                   setTempDay("");

//                   return;
//                 }
//                 setSlots(data);
//                 pushBot("Chọn giờ khám (chọn số)");
//                 pushBot(data.map((s, i) => `${i + 1}. ${s.time}`).join("\n"));
//               }}
//             />
//           </div>
//         )}

//         <div className="border-t p-4 flex gap-2">
//           <input
//             className="flex-1 border rounded-xl px-4 py-2"
//             placeholder="Nhập tin nhắn..."
//             value={input}
//             onChange={(e) => {
//               let value = e.target.value;

//               if (step === "phone") {
//                 value = value.replace(/\D/g, "");
//               }

//               setInput(value);
//             }}
//             onKeyDown={(e) => e.key === "Enter" && handleSend()}
//           />
//           <button
//             onClick={handleSend}
//             className="bg-blue-600 text-white px-4 py-2 rounded-xl"
//           >
//             Gửi
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import ChatClient from "@/app/components/chat/ChatClient";
import { useRequireAuth } from "@/app/hooks/useRequireAuth";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  const { isLoading, isAuthenticated } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <ChatClient />
    </div>
  );
}
