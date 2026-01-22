"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePayment } from "./usePayment";
import { generateSepayQR } from "@/app/lib/payment/sepayqr";

type BookingResponse = {
  id: string;
  status: "pending" | "paid" | "expired";
  amount: number;
};

export default function PaymentClient() {
  const { bookingId } = usePayment();
  const router = useRouter();

  const [booking, setBooking] = useState<BookingResponse | null>(null);

  useEffect(() => {
    if (!bookingId) return;

    fetch(`/api/bookings/${bookingId}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.id) {
          setBooking(data);
        }
      });
  }, [bookingId]);

  useEffect(() => {
    if (!bookingId) return;

    const timer = setInterval(async () => {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!data?.status) return;

      setBooking(data); 

      if (data.status === "paid") {
        router.replace(`/result?bookingId=${bookingId}&status=paid`);
      }

      if (data.status === "expired") {
        router.replace(`/result?bookingId=${bookingId}&status=expired`);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [bookingId, router]);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tạo mã thanh toán...
      </div>
    );
  }

  const qrUrl = generateSepayQR({
    bankCode: "TPB",
    accountNo: "23238628888",
    amount: booking.amount, 
    description: `DATLICH_${booking.id}`,
  });

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-6 rounded-xl text-center space-y-4">
        <h1 className="text-lg font-semibold">Thanh toán giữ lịch</h1>

        <img src={qrUrl} className="w-64 h-64 mx-auto" />

        <p className="text-sm text-slate-600">
          Nội dung chuyển khoản:
          <br />
          <b>DATLICH_{booking.id}</b>
        </p>

        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium
          ${booking.status === "pending" && "bg-orange-100 text-orange-600"}
          ${booking.status === "paid" && "bg-green-100 text-green-600"}
          ${booking.status === "expired" && "bg-red-100 text-red-600"}
        `}
        >
          {booking.status === "pending" && "Chờ thanh toán"}
          {booking.status === "paid" && "Đã thanh toán"}
          {booking.status === "expired" && "Hết hạn"}
        </span>
      </div>
    </main>
  );
}
