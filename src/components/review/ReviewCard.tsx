import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { reviewApi } from "@/api/reviewApi";
import { useAuth } from "@/hooks/useAuth";
import { StarDisplay } from "@/components/shared/StarRating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import type { AxiosError } from "axios";
import type { ApiError } from "@/types";
import ReviewForm from "./ReviewForm";

interface ReviewCardProps {
  review: Review;
  bookId: string;
}

export default function ReviewCard({ review, bookId }: ReviewCardProps) {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isOwner = user?.username === review.username;
  // API trả createdAt/updatedAt lệch nhau vài micro giây khi tạo mới → chỉ coi là đã sửa khi lệch > 1 giây
  const isEdited =
    new Date(review.updatedAt).getTime() -
      new Date(review.createdAt).getTime() >
    1000;

  // useCallback: stable reference cho handler, tránh re-render không cần
  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["reviews", bookId] });
    queryClient.invalidateQueries({ queryKey: ["book", bookId] });
  }, [queryClient, bookId]);

  const likeMutation = useMutation({
    mutationFn: () => reviewApi.toggleLike(review.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", bookId] });
    },
    onError: (err: AxiosError<ApiError>) =>
      toast.error(
        err.response?.data?.message ?? "Không thể thích đánh giá, vui lòng thử lại",
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: () => reviewApi.delete(review.id),
    onSuccess: () => {
      toast.success("Đã xóa đánh giá");
      setConfirmOpen(false);
      invalidateQueries();
    },
    onError: () => toast.error("Xóa thất bại"),
  });


  const handleSuccessEdit = useCallback(() => {
    setEditing(false);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
  }, []);

  if (editing) {
    return (
      <ReviewForm
        bookId={bookId}
        existingReview={review}
        onSuccess={handleSuccessEdit}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <article className="rounded-lg border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="text-sm">
            {review.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-semibold text-sm">{review.username}</span>
            <StarDisplay rating={review.rating} size={13} />
          </div>
          <time
            className="text-xs text-muted-foreground"
            dateTime={review.createdAt}
          >
            {new Date(review.createdAt).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {isEdited && " · đã chỉnh sửa"}
          </time>
        </div>
      </div>

      {/* Nội dung */}
      <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
        {review.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t">
        {/* Like button — chủ review chỉ xem số lượt thích */}
        {isOwner ? (
          <span
            className="flex items-center gap-1.5 text-sm px-2 py-1 text-muted-foreground"
            title="Bạn không thể thích đánh giá của chính mình"
          >
            <Heart size={15} aria-hidden="true" />
            <span className="tabular-nums">{review.likeCount}</span>
            <span className="sr-only">lượt thích</span>
          </span>
        ) : (
          <button
            type="button"
            className={cn(
              "flex items-center gap-1.5 text-sm px-2 py-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isAuthenticated
                ? "hover:bg-muted cursor-pointer"
                : "cursor-default opacity-50",
            )}
            onClick={() =>
              isAuthenticated && !likeMutation.isPending && likeMutation.mutate()
            }
            disabled={!isAuthenticated || likeMutation.isPending}
            aria-pressed={review.likedByCurrentUser}
            aria-label={`${review.likedByCurrentUser ? "Bỏ thích" : "Thích"} đánh giá (${review.likeCount} lượt thích)`}
            title={!isAuthenticated ? "Đăng nhập để thích đánh giá" : undefined}
          >
            <Heart
              size={15}
              aria-hidden="true"
              className={cn(
                "transition-all active:scale-125",
                review.likedByCurrentUser
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground",
              )}
            />
            <span className="text-muted-foreground tabular-nums">
              {review.likeCount}
            </span>
          </button>
        )}

        {/* Owner actions */}
        {isOwner && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
              aria-label="Chỉnh sửa đánh giá"
            >
              <Pencil size={13} />
              Sửa
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmOpen(true)}
              disabled={deleteMutation.isPending}
              aria-label="Xóa đánh giá"
            >
              <Trash2 size={13} />
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Xóa đánh giá này?"
        description="Đánh giá và lượt thích của nó sẽ bị xóa vĩnh viễn. Bạn không thể hoàn tác thao tác này."
        confirmLabel="Xóa đánh giá"
        pending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </article>
  );
}
