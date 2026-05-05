import { BookOpen } from "lucide-react";
import BookCard from "./BookCard";
import type { Book } from "@/types";

interface BookGridProps {
  books: Book[];
}

export default function BookGrid({ books }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3"
        role="status"
        aria-label="Không có kết quả"
      >
        <BookOpen size={48} className="opacity-20" />
        <p className="font-medium text-base">Không tìm thấy sách nào</p>
        <p className="text-sm">Thử tìm kiếm với từ khóa khác</p>
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
