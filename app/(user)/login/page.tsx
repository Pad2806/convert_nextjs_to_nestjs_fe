"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  /* ======================
     REDIRECT SAU LOGIN
  ====================== */
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    if (session.user.role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/");
    }
  }, [status, session, router]);

  /* ======================
     HANDLE LOGIN
  ====================== */
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn("google");
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        alert("Đăng nhập thất bại: " + res.error);
        setIsLoading(false);
      } else {
        // Redirect handled by useEffect
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  /* ======================
     LOADING SESSION
  ====================== */
  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="bg-white border border-blue-200 rounded-xl p-6 text-blue-700 shadow-md">
          Checking session...
        </div>
      </main>
    );
  }

  /* ======================
     UI
  ====================== */
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-4 relative overflow-hidden">
      {/* DECORATION */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-40" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-40" />

      <div className="relative w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-xl p-10 space-y-8">
          {/* HEADER */}
          <div className="space-y-3 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-blue-600" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900">Đăng nhập</h1>

            <p className="text-slate-600">
              Đăng nhập để đặt lịch khám nhanh chóng và an tâm hơn
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <div className="flex-1 h-px bg-slate-200" />
            <span>Hoặc đăng nhập với</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* GOOGLE LOGIN */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-4 border border-slate-200 rounded-xl py-4
              transition-all font-medium text-slate-700 shadow-sm
              hover:bg-slate-50 hover:shadow-md
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span>Google</span>
          </button>

          {/* REGISTER LINK */}
           <div className="text-center text-sm text-slate-600">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-blue-600 font-bold hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
