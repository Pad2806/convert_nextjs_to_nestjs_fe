"use client";

import {
  Phone,
  Building2,
  Calendar,
  User,
  CreditCard,
  Mail,
} from "lucide-react";
import React from "react";

export function BookingDetailCard({ booking }: { booking: any }) {
  const translateStatus = (s: string) => {
    switch (s) {
      case "paid": return "Đã thanh toán";
      case "pending": return "Chờ xử lý";
      case "confirmed": return "Đã xác nhận";
      case "cancelled": return "Đã hủy";
      case "done": return "Hoàn thành";
      case "unpaid": return "Chưa thanh toán";
      case "failed": return "Thất bại";
      default: return s;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 grid md:grid-cols-3 gap-4">
      <Info icon={<Phone />} label="Số điện thoại" value={booking.patient_phone} />
      <Info
        icon={<Mail />}
        label="Email"
        value={booking.patient_email ?? "—"}
      />
      <Info icon={<Building2 />} label="Phòng khám" value={booking.clinic_name} />
      <Info icon={<Calendar />} label="Dịch vụ" value={booking.service_name} />
      <Info icon={<User />} label="Bác sĩ" value={booking.doctor_name ?? "-"} />
      <Info
        icon={<Calendar />}
        label="Thời gian"
        value={new Date(booking.booking_time).toLocaleString("vi-VN")}
      />
      <Info
        icon={<CreditCard />}
        label="Trạng thái"
        value={translateStatus(booking.payment_status ?? "unpaid")}
      />
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-50 p-4 rounded-lg border-blue-300 border">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
        {icon}
        {label}
      </div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
