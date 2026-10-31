import { BookOpen } from "lucide-react";
import BookCard from "./BookCard";
import { Button } from "@/components/ui/button";
import type { Book } from "@/types";

interface BookGridProps {
  books: Book[];
  // Có đang áp dụng tìm kiếm / bộ lọc không — để gợi ý đúng cách thoát khỏi kết quả rỗng
  hasFilters?: boolean;
  onResetFilters?: () => void;
}

export default function BookGrid({
  books,
  hasFilters = false,
  onResetFilters,
}: BookGridProps) {
  if (books.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 text-center"
        role="status"
      >
        <BookOpen size={48} className="opacity-20" />
        <p className="font-medium text-base text-foreground">
          Không tìm thấy sách nào
        </p>
        <p className="text-sm">
          {hasFilters
            ? "Không có sách khớp với từ khóa hoặc thể loại đã chọn."
            : "Hiện chưa có sách nào trong thư viện."}
        </p>
        {hasFilters && onResetFilters && (
          <Button variant="outline" size="sm" onClick={onResetFilters}>
            Xóa bộ lọc
          </Button>
        )}
      </div>
    );
  }

  return (
    // auto-fill: tự tính số cột theo màn hình, không cần breakpoint thủ công
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
