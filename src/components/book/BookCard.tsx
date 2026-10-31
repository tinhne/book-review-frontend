import { memo } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarDisplay } from "@/components/shared/StarRating";
import type { Book } from "@/types";

const PLACEHOLDER = "https://placehold.co/200x280/e2e8f0/94a3b8?text=No+Cover";

// memo: tránh re-render khi parent re-render nhưng props không đổi
// Đặc biệt quan trọng khi render grid 12+ cards
const BookCard = memo(function BookCard({ book }: { book: Book }) {
  return (
    <Link
      to={`/books/${book.id}`}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
    >
      <Card className="h-full overflow-hidden transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30">
        {/* Cover image */}
        <div className="aspect-[2/3] overflow-hidden bg-muted relative">
          <img
            src={book.coverUrl || PLACEHOLDER}
            alt={`Bìa sách ${book.title}`}
            // loading="lazy": không load ảnh cho đến khi vào viewport
            // Tránh load hàng chục ảnh cùng lúc → performance tốt hơn
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              // Tránh infinite loop nếu placeholder cũng lỗi
              if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER;
            }}
          />
        </div>

        <CardContent className="p-3 space-y-1.5">
          {book.categoryName && (
            <Badge variant="secondary" className="max-w-full text-xs font-medium px-2 py-0">
              <span className="truncate">{book.categoryName}</span>
            </Badge>
          )}

          <h3
            className="font-semibold text-sm leading-tight line-clamp-2"
            title={book.title}
          >
            {book.title}
          </h3>

          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
            <BookOpen size={11} className="shrink-0" />
            <span className="truncate">{book.author}</span>
          </p>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50 min-h-[1.75rem]">
            {book.reviewCount > 0 ? (
              <>
                <StarDisplay rating={book.averageRating} size={12} showNumber />
                <span
                  className="text-xs text-muted-foreground tabular-nums whitespace-nowrap"
                  aria-label={`${book.reviewCount.toLocaleString("vi-VN")} đánh giá`}
                  title={`${book.reviewCount.toLocaleString("vi-VN")} đánh giá`}
                >
                  ({book.reviewCount.toLocaleString("vi-VN")})
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                Chưa có đánh giá
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

export default BookCard;
