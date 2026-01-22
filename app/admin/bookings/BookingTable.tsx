"use client";

import { useRouter } from "next/navigation";
import { CreditCard, ChevronRight, Search } from "lucide-react";

type Booking = any;

export function BookingTable({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();

  const badge = (s: string) =>
    s === "paid"
      ? "bg-emerald-100 text-emerald-700"
      : s === "pending"
      ? "bg-amber-100 text-amber-700"
      : "bg-rose-100 text-rose-700";

  const translateStatus = (s: string) => {
    switch (s) {
      case "paid":
        return "Đã thanh toán";
      case "pending":
        return "Chờ xử lý";
      case "expired":
        return "Hết hạn";
      case "failed":
        return "Thất bại";
      case "unpaid":
        return "Chưa thanh toán";
      default:
        return s;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto border border-slate-100">
      <table className="w-full min-w-[1200px]">
        <thead className="bg-slate-50 border-b text-xs text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4 text-left font-semibold min-w-[200px]">Bệnh nhân</th>
            <th className="px-6 py-4 text-left font-semibold min-w-[200px]">Phòng khám</th>
            <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">SĐT</th>
            <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">Thời gian</th>
            <th className="px-6 py-4 text-left font-semibold min-w-[150px]">Dịch vụ</th>
            <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">Bác sĩ</th>
            <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">Trạng thái</th>
            <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">Thanh toán</th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {bookings.length === 0 && (
            <tr>
              <td colSpan={9} className="py-12 text-center text-slate-500">
                <Search className="mx-auto mb-2 w-8 h-8 text-slate-300" />
                Không tìm thấy lịch hẹn nào
              </td>
            </tr>
          )}

          {bookings.map((b) => (
            <tr key={b.booking_id} className="hover:bg-blue-50/50 transition duration-150">
              <td className="px-6 py-4 font-medium text-slate-900">
                {b.patient_name}
                <div className="text-xs text-slate-500 font-normal">
                  {b.patient_email ?? "—"}
                </div>
              </td>
              <td className="px-6 py-4 text-slate-700">{b.clinic_name}</td>
              <td className="px-6 py-4 text-slate-700 whitespace-nowrap">{b.patient_phone}</td>
              <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                {new Date(b.booking_time).toLocaleString("vi-VN")}
              </td>
              <td className="px-6 py-4 text-slate-700">{b.service_name}</td>
              <td className="px-6 py-4 text-slate-700 whitespace-nowrap">{b.doctor_name ?? "-"}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${badge(
                    b.booking_status
                  )}`}
                >
                  {translateStatus(b.booking_status)}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                <div className="flex items-center">
                   <CreditCard className="w-4 h-4 mr-1.5 text-slate-400" />
                   {translateStatus(b.payment_status ?? "unpaid")}
                </div>
              </td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <button
                  onClick={() => router.push(`/admin/bookings/${b.booking_id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
                >
                  Xem <ChevronRight className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
