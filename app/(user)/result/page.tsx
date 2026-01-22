import { Suspense } from "react";
import ResultClient from "@/app/components/result/Result";

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Đang xử lý kết quả...
        </div>
      }
    >
      <ResultClient />
    </Suspense>
  );
}
