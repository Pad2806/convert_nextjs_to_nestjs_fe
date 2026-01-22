"use client";

import AdminBookingsPage from "./bookings/page";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white  rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Xếp lịch khám</h2>
        <p className="text-slate-600 mt-1">
          Danh sách và quản lý các lịch hẹn khám bệnh
        </p>
      </div>

      <AdminBookingsPage />
    </div>
  );
}
