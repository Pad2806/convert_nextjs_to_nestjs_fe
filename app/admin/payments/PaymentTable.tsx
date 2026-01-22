"use client";

import { CreditCard } from "lucide-react";

type Payment = any;

export function PaymentTable({ payments }: { payments: Payment[] }) {
  const badge = (s: string) =>
    s === "paid"
      ? "bg-emerald-100 text-emerald-700"
      : s === "pending"
      ? "bg-amber-100 text-amber-700"
      : "bg-rose-100 text-rose-700";

  const translateStatus = (s: string) => {
    switch (s) {
      case "paid": return "Đã thanh toán";
      case "pending": return "Chờ xử lý";
      case "failed": return "Thất bại";
      default: return s;
    }
  };

  return (
    <div className="bg-white border border-blue-200 rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full min-w-[1200px]">
        <thead className="bg-blue-50 border-b border-blue-200 text-xs text-blue-700 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4 text-left font-semibold min-w-[200px]">Bệnh nhân</th>
            <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">SĐT</th>
            <th className="px-6 py-4 text-left font-semibold min-w-[200px]">Phòng khám</th>
            <th className="px-6 py-4 text-left font-semibold min-w-[150px]">Dịch vụ</th>
            <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">Số tiền</th>
            <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">Phương thức</th>
            <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">Trạng thái</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-blue-50">
          {payments.length === 0 && (
            <tr>
              <td colSpan={7} className="py-12 text-center text-blue-600">
                Không tìm thấy giao dịch nào
              </td>
            </tr>
          )}

          {payments.map((p) => (
            <tr key={p.payment_id} className="hover:bg-blue-50/50 transition">
              <td className="px-6 py-4 font-medium text-slate-900">
                {p.patient_name}
                <div className="text-xs text-slate-500 font-normal">
                  {p.patient_email ?? "—"}
                </div>
              </td>
              <td className="px-6 py-4 text-slate-700 whitespace-nowrap">{p.patient_phone}</td>
              <td className="px-6 py-4 text-slate-700">{p.clinic_name}</td>
              <td className="px-6 py-4 text-slate-700">{p.service_name}</td>
              <td className="px-6 py-4 font-bold text-blue-700 whitespace-nowrap">
                {p.amount?.toLocaleString()} đ
              </td>
              <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                <CreditCard className="inline w-4 h-4 mr-1 text-slate-400" />
                {p.payment_method ?? "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${badge(
                    p.payment_status
                  )}`}
                >
                  {translateStatus(p.payment_status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
