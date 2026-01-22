"use client";

type Props = {
  page: number;
  limit: number;
  total: number;
  onPageChange: (p: number) => void;
};

export function Pagination({ page, limit, total, onPageChange }: Props) {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-slate-600">
        Page {page} of {totalPages} · {total} bookings
      </div>

      <div className="flex gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50"
        >
          Previous
        </button>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
