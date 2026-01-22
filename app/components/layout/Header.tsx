"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="relative h-12 w-48">
             <Image 
                src="/logo-thiennhan-horizontal.png" 
                alt="Thien Nhan Hospital" 
                fill
                className="object-contain object-left"
                priority
             />
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/#guide"
            className="text-sm text-slate-700 hover:text-blue-600"
          >
            Hướng dẫn đặt lịch
          </Link>

          {status === "loading" && (
            <div className="text-sm text-slate-400">...</div>
          )}
          {status === "unauthenticated" && (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl border border-blue-100 text-blue-600 hover:bg-blue-50 transition text-sm"
            >
              Đăng nhập
            </Link>
          )}
          {status === "authenticated" && session?.user && (
            <div className="flex items-center gap-3">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt="avatar"
                  className="w-9 h-9 rounded-full"
                />
              )}
              <span className="text-sm font-medium text-slate-700">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-slate-500 hover:text-red-500"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
