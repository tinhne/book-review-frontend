import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Hiện tối đa 5 trang xung quanh trang hiện tại
  // Tránh render quá nhiều nút khi totalPages lớn
  const visiblePages = Array.from({ length: totalPages }, (_, i) => i).filter(
    (i) => Math.abs(i - page) <= 2,
  );

  return (
    <nav
      aria-label="Phân trang"
      className="flex items-center justify-center gap-1.5 mt-8"
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        aria-label="Trang trước"
      >
        <ChevronLeft size={16} />
      </Button>

      {/* Hiện dấu ... nếu không bắt đầu từ trang 0 */}
      {visiblePages[0] > 0 && (
        <span className="px-2 text-muted-foreground text-sm">...</span>
      )}

      {visiblePages.map((i) => (
        <Button
          key={i}
          variant={i === page ? "default" : "outline"}
          size="sm"
          className="w-9"
          onClick={() => onChange(i)}
          aria-label={`Trang ${i + 1}`}
          aria-current={i === page ? "page" : undefined}
        >
          {i + 1}
        </Button>
      ))}

      {/* Hiện dấu ... nếu không kết thúc ở trang cuối */}
      {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
        <span className="px-2 text-muted-foreground text-sm">...</span>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label="Trang sau"
      >
        <ChevronRight size={16} />
      </Button>
    </nav>
  );
}
