import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { AxiosError } from "axios";

const PLACEHOLDER = "https://placehold.co/240x340/e2e8f0/94a3b8?text=No+Cover";

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [reviewPage, setReviewPage] = useState(0);

  const {
    data: book,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
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

  // Mở trực tiếp từ link chia sẻ thì không có lịch sử trong app → quay về trang chủ
  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate("/");
  };

  if (isLoading) return <BookDetailSkeleton />;

  const notFound =
    (error as AxiosError | null)?.response?.status === 404 ||
    (!isError && !book);

  if (isError && !notFound) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <ErrorState
          title="Không tải được thông tin sách"
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      </div>
    );
  }

  if (notFound || !book) {
    return (
      <div className="text-center py-20 text-muted-foreground space-y-2">
        <BookOpen size={44} className="mx-auto opacity-20" />
        <p className="font-medium text-foreground">Không tìm thấy sách</p>
        <p className="text-sm">Cuốn sách này không tồn tại hoặc đã bị xóa.</p>
        <Button variant="outline" onClick={() => navigate("/")} className="mt-2">
          Về trang chủ
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Back */}
      <Button variant="outline" size="sm" onClick={goBack}>
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
      <section aria-labelledby="reviews-heading" className="space-y-5">
        <h2
          id="reviews-heading"
          className="text-xl font-bold flex items-center gap-2"
        >
          <Star size={18} className="text-amber-400 fill-amber-400" aria-hidden="true" />
          Đánh giá ({book.reviewCount.toLocaleString("vi-VN")})
        </h2>

        {/* Login prompt hoặc form viết review */}
        {isAuthenticated ? (
          <ReviewForm bookId={id!} />
        ) : (
          <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 flex-wrap gap-3">
            <p className="text-sm text-muted-foreground">
              Đăng nhập để viết đánh giá của bạn
            </p>
            <Button
              size="sm"
              onClick={() => navigate("/login", { state: { from: location } })}
            >
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
            <p className="font-medium">Chưa có đánh giá nào</p>
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

function BookDetailSkeleton() {
  return (
    <div
      className="mx-auto max-w-4xl px-4 py-8 space-y-8"
      role="status"
      aria-label="Đang tải thông tin sách"
    >
      <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
      <div className="flex gap-8 flex-wrap">
        <div className="w-44 aspect-[2/3] rounded-xl bg-muted animate-pulse" />
        <div className="flex-1 min-w-[16rem] space-y-3">
          <div className="h-5 w-24 rounded-full bg-muted animate-pulse" />
          <div className="h-9 w-3/4 rounded bg-muted animate-pulse" />
          <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
          <div className="h-20 w-56 rounded-xl bg-muted animate-pulse" />
          <div className="space-y-2 pt-2">
            <div className="h-3 w-full rounded bg-muted animate-pulse" />
            <div className="h-3 w-full rounded bg-muted animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
