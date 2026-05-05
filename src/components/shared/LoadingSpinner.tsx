import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  fullPage?: boolean;
  size?: "sm" | "md" | "lg";
}

// Kích thước map — tránh string nối động gây Tailwind purge miss
const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-4",
  lg: "h-12 w-12 border-4",
} as const;

export default function LoadingSpinner({
  className,
  fullPage = false,
  size = "md",
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      role="status"
      aria-label="Đang tải..."
      className={cn(
        "animate-spin rounded-full border-border border-t-primary",
        sizeMap[size],
        className,
      )}
    />
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center py-10">{spinner}</div>;
}
