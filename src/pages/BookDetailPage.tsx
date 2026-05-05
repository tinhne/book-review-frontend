import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, BookOpen, Star } from "lucide-react";
import { bookApi } from "@/api/bookApi";
import { reviewApi } from "@/api/reviewApi";
import { useAuth } from "@/hooks/useAuth";
import { StarDisplay } from "@/components/shared/StarRating";
import ReviewCard from "@/components/review/ReviewCard";
import ReviewForm from "@/components/review/ReviewForm";
import Pagination from "@/components/shared/Pagination";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PLACEHOLDER = "https://placehold.co/240x340/e2e8f0/94a3b8?text=No+Cover";

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [reviewPage, setReviewPage] = useState(0);

  const { data: book, isLoading } = useQuery({
    queryKey: ["book", id],
    queryFn: () => bookApi.getBook(id!).then((r) => r.data),
    enabled: !!id,
  });

  const { data: reviewData, isLoading: reviewLoading } = useQuery({
    queryKey: ["reviews", id, reviewPage],
    queryFn: () =>
      reviewApi
        .getByBook(id!, { page: reviewPage, size: 10 })
        .then((r) => r.data),
    enabled: !!id,
    placeholderData: (prev) => prev,
  });

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!book) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="font-medium">Không tìm thấy sách</p>
        <Button variant="link" onClick={() => navigate(-1)} className="mt-2">
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Back */}
      <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft size={14} /> Quay lại
      </Button>

      {/* Book info */}
      <section className="flex gap-8 flex-wrap" aria-label="Thông tin sách">
        {/* Cover */}
        <div className="shrink-0 w-44 rounded-xl overflow-hidden shadow-xl self-start">
          <img
            src={book.coverUrl || PLACEHOLDER}
            alt={`Bìa sách ${book.title}`}
            className="w-full block"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER;
            }}
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-3">
          {book.category && (
            <Badge variant="secondary">{book.category.name}</Badge>
          )}

          <h1 className="text-3xl font-extrabold leading-tight">
            {book.title}
          </h1>

          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <BookOpen size={14} />
            {book.author}
          </p>

          {book.isbn && (
            <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>
          )}

          {/* Rating summary box */}
          <div className="inline-flex items-center gap-4 bg-muted rounded-xl px-5 py-3">
            <span className="text-5xl font-black tabular-nums">
              {book.averageRating.toFixed(1)}
            </span>
            <div className="space-y-1">
              <StarDisplay rating={book.averageRating} size={20} />
              <p className="text-xs text-muted-foreground">
                {book.reviewCount.toLocaleString("vi-VN")} lượt đánh giá
              </p>
            </div>
          </div>

          {book.description && (
            <div className="space-y-1.5">
              <h2 className="font-semibold text-sm">Giới thiệu</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {book.description}
              </p>
            </div>
          )}
        </div>
      </section>

      <Separator />

      {/* Reviews section */}
      <section aria-label="Danh sách review" className="space-y-5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Star size={18} className="text-amber-400 fill-amber-400" />
          Reviews ({book.reviewCount.toLocaleString("vi-VN")})
        </h2>

        {/* Login prompt hoặc form viết review */}
        {isAuthenticated ? (
          <ReviewForm bookId={id!} />
        ) : (
          <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 flex-wrap gap-3">
            <p className="text-sm text-muted-foreground">
              Đăng nhập để viết review của bạn
            </p>
            <Button size="sm" onClick={() => navigate("/login")}>
              Đăng nhập
            </Button>
          </div>
        )}

        {/* Loading */}
        {reviewLoading && <LoadingSpinner size="sm" />}

        {/* Empty state */}
        {!reviewLoading && reviewData?.content.length === 0 && (
          <div
            className="text-center py-12 text-muted-foreground space-y-2"
            role="status"
          >
            <Star size={40} className="mx-auto opacity-20" />
            <p className="font-medium">Chưa có review nào</p>
            <p className="text-sm">Hãy là người đầu tiên chia sẻ cảm nhận!</p>
          </div>
        )}

        {/* Review list */}
        <div className="space-y-3">
          {reviewData?.content.map((review) => (
            <ReviewCard key={review.id} review={review} bookId={id!} />
          ))}
        </div>

        {reviewData && (
          <Pagination
            page={reviewData.page}
            totalPages={reviewData.totalPages}
            onChange={setReviewPage}
          />
        )}
      </section>
    </div>
  );
}
