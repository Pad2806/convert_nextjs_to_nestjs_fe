"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResultClient() {
  const params = useSearchParams();
  const router = useRouter();
  const bookingId = params.get("bookingId");

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;

    fetch(`/api/bookings/${bookingId}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setBooking(data);
        setLoading(false);
      });
  }, [bookingId]);

  if (!bookingId) {
    return <div className="text-center">Thiếu thông tin kết quả</div>;
  }

  if (loading) {
    return <div className="text-center">Đang tải kết quả...</div>;
  }

  if (!booking) {
    return <div className="text-center">Booking không tồn tại</div>;
  }

  if (booking.status === "paid") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow p-8 text-center space-y-4">
          <h1 className="text-2xl font-semibold text-green-600">
            Đặt lịch thành công
          </h1>
          <p className="text-slate-600">Lịch khám của bạn đã được xác nhận.</p>
          <ul className="text-sm text-slate-500 text-left mt-4 space-y-2">
            <li>• Hệ thống đã ghi nhận thanh toán</li>
            <li>• Phòng khám đang tiếp nhận hồ sơ</li>
            <li>• Nhân viên sẽ liên hệ xác nhận</li>
          </ul>
        </div>
      </main>
    );
  }

  if (booking.status === "expired") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow p-8 text-center space-y-4">
          <h1 className="text-2xl font-semibold text-red-600">
            Thanh toán quá hạn
          </h1>
          <p className="text-slate-600">
            Phiên thanh toán đã hết hạn sau 5 phút.
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-4 w-full rounded-xl bg-blue-600 text-white py-3"
          >
            Đăng ký lại
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow p-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-orange-500">
          Chưa thanh toán
        </h1>
        <p className="text-slate-600">
          Chúng tôi chưa ghi nhận thanh toán cho lịch này.
        </p>
      </div>
    </main>
  );
}
