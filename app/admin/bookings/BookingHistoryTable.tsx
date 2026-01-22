"use client";

export function BookingHistoryTable({
  history,
  currentId,
}: {
  history: any[];
  currentId: string;
}) {
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
    <div className="bg-white rounded-xl p-6">
      <h2 className="font-semibold text-lg mb-4">Lịch sử đặt lịch</h2>

      <table className="w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="py-2 text-left">Thời gian</th>
            <th className="py-2 text-left">Phòng khám</th>
            <th className="py-2 text-left">Dịch vụ</th>
            <th className="py-2 text-left">Trạng thái</th>
            <th className="py-2 text-left">Thanh toán</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {history.map((h) => (
            <tr
              key={h.booking_id}
              className={h.booking_id === currentId ? "bg-blue-50" : ""}
            >
              <td className="py-3">
                {new Date(h.booking_time).toLocaleString("vi-VN")}
              </td>
              <td className="py-3">{h.clinic_name}</td>
              <td className="py-3">{h.service_name}</td>
              <td className="py-3">{translateStatus(h.booking_status)}</td>
              <td className="py-3">{translateStatus(h.payment_status ?? "unpaid")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
