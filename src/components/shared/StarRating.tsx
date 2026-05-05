import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── StarDisplay: chỉ đọc ──────────────────────────────────────────────────
interface StarDisplayProps {
  rating: number;
  size?: number;
  showNumber?: boolean;
  className?: string;
}

export function StarDisplay({
  rating,
  size = 16,
  showNumber = false,
  className,
}: StarDisplayProps) {
  // Làm tròn để fill đúng số sao
  const rounded = Math.round(rating);

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${rating.toFixed(1)} trên 5 sao`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < rounded
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground",
          )}
        />
      ))}
      {showNumber && (
        <span className="ml-1 text-sm text-muted-foreground tabular-nums">
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}

// ─── StarInput: cho phép click chọn ───────────────────────────────────────
interface StarInputProps {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

export function StarInput({
  value,
  onChange,
  disabled = false,
}: StarInputProps) {
  return (
    <span
      className={cn(
        "inline-flex gap-1",
        disabled && "pointer-events-none opacity-50",
      )}
      role="group"
      aria-label="Chọn số sao"
    >
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        return (
          <Star
            key={star}
            size={28}
            // aria cho accessibility
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} sao`}
            tabIndex={0}
            className={cn(
              "cursor-pointer transition-colors",
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground hover:fill-amber-300 hover:text-amber-300",
            )}
            onClick={() => !disabled && onChange(star)}
            onKeyDown={(e) => {
              // Keyboard accessible: Enter hoặc Space để chọn
              if ((e.key === "Enter" || e.key === " ") && !disabled) {
                e.preventDefault();
                onChange(star);
              }
            }}
          />
        );
      })}
    </span>
  );
}
