import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL as string;

export default function BackendWakeUp({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<"checking" | "waking" | "ready">(
    "checking",
  );
  const [dots, setDots] = useState("");

  useEffect(() => {
    let isMounted = true;
    let attempts = 0;

    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);

    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/api/health`, {
          signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
          if (isMounted) setStatus("ready");
          clearInterval(dotInterval);
          return;
        }
      } catch {
        // ignore
      }

      attempts++;

      if (attempts >= 2 && isMounted) {
        setStatus("waking");
      }

      if (attempts < 15) {
        setTimeout(checkBackend, 2000);
      } else {
        // fallback: không bắt user chờ vô hạn
        if (isMounted) setStatus("ready");
        clearInterval(dotInterval);
      }
    };

    checkBackend();

    return () => {
      isMounted = false;
      clearInterval(dotInterval);
    };
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
          ? "Server đang wake up (Render free tier). Thường mất ~20–40s."
          : "Đang kiểm tra kết nối..."}
      </p>
    </div>
  );
}
