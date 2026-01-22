"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useRequireAuth } from "@/app/hooks/useRequireAuth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLoading } = useRequireAuth({ roles: ["admin"] });
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white border rounded-xl p-6 shadow">
          Checking admin permission...
        </div>
      </div>
    );
  }

  const item = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`block px-4 py-3 rounded-xl font-medium transition
          ${
            active
              ? "bg-blue-50 text-blue-900 border border-blue-200"
              : "text-slate-700 hover:bg-slate-100"
          }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="h-screen flex bg-slate-100 overflow-hidden">
      <aside className="w-55 bg-white border-r h-full flex-shrink-0 px-4 py-6 overflow-y-auto">
        <div className="text-blue-700 font-bold text-lg mb-6">Clinic Admin</div>

        <nav className="space-y-1">
          <Link
            href="/admin/bookings"
            className="block px-4 py-2 rounded-lg text-slate-700 hover:bg-blue-50"
          >
            Quản lý lịch hẹn
          </Link>

          <Link
            href="/admin/payments"
            className="block px-4 py-2 rounded-lg text-slate-700 hover:bg-blue-50"
          >
            Quản lý thanh toán
          </Link>


          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 mt-4"
          >
            Đăng xuất
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
