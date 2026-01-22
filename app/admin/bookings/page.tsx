"use client";

import { useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/app/hooks/useRequireAuth";
import { BookingFilters } from "./BookingFilters";
import { BookingTable } from "./BookingTable";
import { Pagination } from "@/app/components/Pagination";

type Clinic = { id: string; name: string };

export default function AdminBookingsPage() {
  const { user, isLoading } = useRequireAuth({ roles: ["admin"] });

  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("all");
  const [clinicId, setClinicId] = useState("");

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  useEffect(() => {
    fetch("/api/admin/clinics", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => setClinics(Array.isArray(res) ? res : []))
      .catch(() => setClinics([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [phone, status, clinicId, limit]);

  useEffect(() => {
    if (!user || isLoading) return;

    setLoading(true);

    const params = new URLSearchParams({
      phone,
      status,
      clinicId,
      page: String(page),
      limit: String(limit),
    });

    fetch(`/api/admin/bookings?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        setBookings(res?.data ?? []);
        setTotal(res?.total ?? 0);
      })
      .catch(() => {
        setBookings([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [user, isLoading, phone, status, clinicId, page, limit]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-blue-200 rounded-xl p-6 text-blue-700 shadow-md">
            Checking permission...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900 flex items-center gap-2">
                Quản lý Lịch hẹn
              </h1>
              <p className="text-blue-700 mt-1">
                Quản lý cuộc hẹn của bệnh nhân tại các phòng khám
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-white border border-blue-200 text-sm text-blue-700 shadow-sm">
                Tổng số: <span className="font-semibold">{total}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white border border-blue-200 text-sm text-blue-700 shadow-sm">
                Trang:{" "}
                <span className="font-semibold">
                  {page}/{totalPages}
                </span>
              </div>
            </div>
          </div>
        </div>

        <BookingFilters
          phone={phone}
          status={status}
          clinicId={clinicId}
          clinics={clinics}
          onPhoneChange={setPhone}
          onStatusChange={setStatus}
          onClinicChange={setClinicId}
        />

        {loading ? (
          <div className="bg-white border border-blue-200 rounded-2xl p-12 text-center text-blue-600 shadow-sm animate-pulse">
            Đang tải dữ liệu...
          </div>
        ) : (
          <div className="space-y-4">
            <BookingTable bookings={bookings} />

            <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-blue-700">
                    Số dòng mỗi trang
                  </span>

                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    disabled={loading}
                    className="border border-blue-300 rounded-xl px-3 py-2 text-sm bg-white
                               focus:ring-2 focus:ring-blue-400 focus:outline-none
                               disabled:opacity-50"
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end">
                  <Pagination
                    page={page}
                    limit={limit}
                    total={total}
                    onPageChange={setPage}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
