import { useRef, useState } from "react";
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
      role="img"
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

// ─── StarInput: cho phép chọn số sao (radiogroup, hỗ trợ bàn phím) ─────────
const RATING_LABELS = ["", "Rất tệ", "Tệ", "Bình thường", "Hay", "Tuyệt vời"];

interface StarInputProps {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  invalid?: boolean;
  labelledBy?: string;
  describedBy?: string;
}

export function StarInput({
  value,
  onChange,
  disabled = false,
  invalid = false,
  labelledBy,
  describedBy,
}: StarInputProps) {
  const [hovered, setHovered] = useState(0);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const display = hovered || value;
  // Roving tabindex: chỉ một ngôi sao nhận Tab, các sao còn lại di chuyển bằng phím mũi tên
  const tabStop = value > 0 ? value : 1;

  const select = (star: number) => {
    if (disabled) return;
    onChange(star);
    buttonsRef.current[star - 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, star: number) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(5, star + 1);
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(1, star - 1);
    if (e.key === "Home") next = 1;
    if (e.key === "End") next = 5;
    if (next !== null) {
      e.preventDefault();
      select(next);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : "Chọn số sao"}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className={cn(
          "inline-flex gap-0.5 rounded-md",
          disabled && "pointer-events-none opacity-50",
        )}
        onMouseLeave={() => setHovered(0)}
      >
        {Array.from({ length: 5 }, (_, i) => {
          const star = i + 1;
          return (
            <button
              key={star}
              ref={(el) => {
                buttonsRef.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={star === value}
              aria-label={`${star} sao – ${RATING_LABELS[star]}`}
              tabIndex={star === tabStop ? 0 : -1}
              disabled={disabled}
              className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => select(star)}
              onMouseEnter={() => setHovered(star)}
              onKeyDown={(e) => handleKeyDown(e, star)}
            >
              <Star
                size={28}
                aria-hidden="true"
                className={cn(
                  "transition-colors",
                  star <= display
                    ? "fill-amber-400 text-amber-400"
                    : invalid
                      ? "fill-muted text-destructive/60"
                      : "fill-muted text-muted-foreground",
                )}
              />
            </button>
          );
        })}
      </div>
      <span
        className="text-sm font-medium text-muted-foreground min-w-[5.5rem]"
        aria-hidden="true"
      >
        {RATING_LABELS[display]}
      </span>
    </div>
  );
}
