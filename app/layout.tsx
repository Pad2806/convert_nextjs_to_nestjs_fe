import "./globals.css";
import { Be_Vietnam_Pro } from "next/font/google";
import AuthProvider from "@/app/provider/SessionProvider";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-be-vietnam",
});

export const metadata = {
  title: "Thiện Nhân Hospital - Đặt lịch khám",
  description: "Hệ thống đặt lịch khám bệnh trực tuyến - Bệnh viện Thiện Nhân",
  icons: {
    icon: "/logo-thiennhan-square.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body
        suppressHydrationWarning
        className={`${beVietnam.variable} bg-slate-50 text-slate-900`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
