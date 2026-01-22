"use client";

import { Phone, Building2, Filter } from "lucide-react";

type Clinic = { id: string; name: string };

type Props = {
  phone: string;
  status: string;
  clinicId: string;
  clinics: Clinic[];
  onPhoneChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onClinicChange: (v: string) => void;
};

export function BookingFilters({
  phone,
  status,
  clinicId,
  clinics,
  onPhoneChange,
  onStatusChange,
  onClinicChange,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-blue-700">Phòng khám</label>
          <div className="relative mt-1">
            <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <select
              value={clinicId}
              onChange={(e) => onClinicChange(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả phòng khám</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-blue-700">SĐT Bệnh nhân</label>
          <div className="relative mt-1">
            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="Tìm theo số điện thoại..."
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-blue-700">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="paid">Đã thanh toán</option>
            <option value="expired">Hết hạn</option>
          </select>
        </div>
      </div>
    </div>
  );
}
