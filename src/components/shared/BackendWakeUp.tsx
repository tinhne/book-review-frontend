import { useEffect, useState } from "react";

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
      <p className="font-semibold text-lg">
        {status === "checking" ? "Đang kết nối" : "Đang khởi động server"}
        {dots}
      </p>
      <p className="text-sm text-muted-foreground max-w-xs">
        {status === "waking"
          ? "Server đang wake up sau thời gian không hoạt động. Vui lòng chờ khoảng 30-60 giây."
          : "Đang kiểm tra kết nối tới server..."}
      </p>
      {status === "waking" && (
        <p className="text-xs text-muted-foreground">
          Đây là giới hạn của Render Free tier
        </p>
      )}
    </div>
  );
}
