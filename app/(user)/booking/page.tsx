"use client";

import BookingForm from "@/app/components/booking/BookingForm";
import { useRequireAuth } from "@/app/hooks/useRequireAuth";
import { Loader2 } from "lucide-react";

export default function BookingsPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-4 py-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900">
            Đặt lịch khám bệnh
          </h1>
          <p className="text-lg text-slate-600 mt-2">
            Hoàn tất thông tin bên dưới để giữ lịch
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-blue-200/30 blur-3xl rounded-3xl" />
          <BookingForm />
        </div>
      </div>
    </div>
  );
}
