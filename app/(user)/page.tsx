"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calendar,
  Shield,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  Clock,
  Users,
  Award,
} from "lucide-react";

const carouselItems = [
  {
    title: "Đặt lịch khám dễ dàng",
    description: "Chỉ vài thao tác, không cần chờ đợi",
    icon: Calendar,
  },
  {
    title: "Bác sĩ & phòng khám uy tín",
    description: "Thông tin rõ ràng, được xác thực",
    icon: Shield,
  },
  {
    title: "Minh bạch chi phí",
    description: "Biết trước chi phí, không phát sinh",
    icon: DollarSign,
  },
];

const stats = [
  { label: "Bác sĩ uy tín", value: "500+", icon: Users },
  { label: "Lịch hẹn thành công", value: "10,000+", icon: CheckCircle2 },
  { label: "Thời gian chờ trung bình", value: "< 5 phút", icon: Clock },
  { label: "Đánh giá từ bệnh nhân", value: "4.9/5", icon: Award },
];

export default function HomePage() {
  const router = useRouter();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Nền tảng đặt lịch y tế hàng đầu</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Đặt lịch khám
                <span className="block text-blue-600 mt-2">
                  nhanh chóng & an tâm
                </span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed">
                Nền tảng kết nối bệnh nhân với bác sĩ và phòng khám uy tín.
                <span className="font-semibold text-slate-700">
                  {" "}
                  Không xếp hàng – không chờ đợi.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push("/booking")}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg text-white font-semibold hover:bg-blue-700 transition-all hover:shadow-xl hover:scale-105"
                >
                  Đăng ký đặt lịch
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => router.push("/chat")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-slate-200 px-8 py-4 text-lg text-slate-700 font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  Tư vấn
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
                {carouselItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={index}
                      className={`transition-all duration-500 ${
                        index === active
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95 absolute inset-0 pointer-events-none"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                          <IconComponent className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1 pt-1">
                          <h3 className="text-2xl font-bold text-slate-900 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-lg text-slate-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Dots */}
                <div className="flex justify-center gap-2 pt-4">
                  {carouselItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActive(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === active
                          ? "w-8 bg-blue-600"
                          : "w-2 bg-slate-300 hover:bg-slate-400"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24" id="guide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Hướng dẫn đặt lịch
            </h2>
            <p className="text-xl text-slate-600">Chỉ với 3 bước đơn giản</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Chọn dịch vụ",
                desc: "Chọn bác sĩ hoặc phòng khám phù hợp với nhu cầu của bạn.",
              },
              {
                step: 2,
                title: "Đăng ký thông tin",
                desc: "Nhập thông tin cá nhân và mô tả nhu cầu khám bệnh.",
              },
              {
                step: 3,
                title: "Xác nhận lịch",
                desc: "Nhận thông báo xác nhận và nhắc nhở từ hệ thống.",
              },
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-blue-200 h-full">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-lg">
                    {item.step}
                  </div>

                  <div className="pt-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-blue-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Sẵn sàng đặt lịch khám?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Chủ động thời gian – minh bạch chi phí – an tâm điều trị
          </p>

          <button
            onClick={() => router.push("/booking")}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-10 py-5 text-lg text-blue-600 font-bold hover:bg-blue-50 transition-all hover:shadow-2xl hover:scale-105"
          >
            Đăng ký ngay
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
}
