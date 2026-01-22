"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Đăng ký thất bại");
      }

      // Auto login after register
      await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      router.push("/");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
      setIsLoading(false);
    }
  };

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

            <h1 className="text-3xl font-bold text-slate-900">Đăng ký tài khoản</h1>

            <p className="text-slate-600">
              Tạo tài khoản để đặt lịch khám và quản lý hồ sơ bệnh án
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleRegister} className="space-y-4">
             <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

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
              {isLoading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>

           <div className="text-center text-sm text-slate-600">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-blue-600 font-bold hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
