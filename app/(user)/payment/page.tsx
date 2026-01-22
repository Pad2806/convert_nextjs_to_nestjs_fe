import { Suspense } from "react";
import PaymentClient from "@/app/components/payment/Payment";

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Đang tải thông tin thanh toán...
        </div>
      }
    >
      <PaymentClient />
    </Suspense>
  );
}
