"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookingDetailCard } from "../BookingDetailCard";
import { BookingHistoryTable } from "../BookingHistoryTable";

export default function AdminBookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/admin/bookings/${id}`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <button onClick={() => router.back()} className="text-blue-600">
        ← Back
      </button>

      <h1 className="text-2xl font-bold">{data.booking.patient_name}</h1>

      <BookingDetailCard booking={data.booking} />

      <BookingHistoryTable
        history={data.history}
        currentId={data.booking.booking_id}
      />
    </div>
  );
}
