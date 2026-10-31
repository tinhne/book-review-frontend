import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export default function ErrorState({
  title = "Không tải được dữ liệu",
  description = "Kết nối tới máy chủ gặp sự cố. Vui lòng thử lại.",
  onRetry,
  retrying = false,
}: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-14 px-4 text-center"
      role="alert"
    >
      <AlertCircle size={36} className="text-destructive/70" />
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={retrying}
          className="mt-1"
        >
          <RotateCw size={14} className={retrying ? "animate-spin" : ""} />
          {retrying ? "Đang thử lại..." : "Thử lại"}
        </Button>
      )}
    </div>
  );
}
