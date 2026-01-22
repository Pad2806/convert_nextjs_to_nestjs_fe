"use client";

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

export function PaymentFilters({
  phone,
  status,
  clinicId,
  clinics,
  onPhoneChange,
  onStatusChange,
  onClinicChange,
}: Props) {
  return (
    <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-blue-700">Phòng khám</label>
          <select
            value={clinicId}
            onChange={(e) => onClinicChange(e.target.value)}
            className="mt-1 w-full border border-blue-300 rounded-xl px-3 py-2 bg-white
              focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="">Tất cả phòng khám</option>
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-blue-700">
            SĐT Bệnh nhân
          </label>
          <input
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="Tìm theo số điện thoại..."
            className="mt-1 w-full border border-blue-300 rounded-xl px-3 py-2 bg-white
              focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-blue-700">
            Trạng thái thanh toán
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="mt-1 w-full border border-blue-300 rounded-xl px-3 py-2 bg-white
              focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="all">Tất cả</option>
            <option value="paid">Đã thanh toán</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="failed">Thất bại</option>
          </select>
        </div>
      </div>
    </div>
  );
}
