import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { BookGridSkeleton } from "@/components/book/BookCardSkeleton";

const API_URL = import.meta.env.VITE_API_URL as string;

export default function BackendWakeUp({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<"checking" | "ready" | "waking">(
    "checking",
  );
  const [dots, setDots] = useState("");

  useEffect(() => {
    let attempts = 0;
    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);

    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`, {
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          setStatus("ready");
          clearInterval(dotInterval);
          return;
        }
      } catch {
        // Backend chưa sẵn sàng
      }

      attempts++;
      if (attempts === 2) setStatus("waking");

      // Thử lại mỗi 3 giây, tối đa 20 lần (~60 giây)
      if (attempts < 20) {
        setTimeout(checkBackend, 3000);
      } else {
        // Sau 60 giây vẫn không được → cho qua luôn
        setStatus("ready");
        clearInterval(dotInterval);
      }
    };

    checkBackend();
    return () => clearInterval(dotInterval);
  }, []);

  if (status === "ready") return <>{children}</>;

  // Khung giao diện (app shell) trong lúc chờ server: người dùng thấy ngay bố cục trang
  // thay vì một màn hình trắng chỉ có spinner
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 text-xl font-bold">
          <BookOpen className="text-primary" size={24} aria-hidden="true" />
          <span>BookReview</span>
        </div>
      </header>

      <div
        className="border-b bg-primary/5 px-4 py-2.5 text-center text-sm"
        role="status"
        aria-live="polite"
      >
        <span className="inline-flex items-center gap-2 font-medium">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          {status === "checking" ? "Đang kết nối tới máy chủ" : "Máy chủ đang khởi động"}
          {dots}
        </span>
        {status === "waking" && (
          <span className="block text-xs text-muted-foreground sm:ml-2 sm:inline">
            Lần truy cập đầu tiên sau một thời gian có thể mất tới một phút.
          </span>
        )}
      </div>

      <div className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-10" aria-hidden="true">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="h-12 w-3/4 max-w-md rounded-lg bg-muted animate-pulse" />
          <div className="h-5 w-1/2 max-w-xs rounded bg-muted animate-pulse" />
          <div className="h-12 w-full max-w-lg rounded-full bg-muted animate-pulse" />
        </div>
        <BookGridSkeleton count={6} />
      </div>
    </div>
  );
}
