import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reviewApi } from "@/api/reviewApi";
import type { CreateReviewPayload, UpdateReviewPayload } from "@/api/reviewApi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarInput } from "@/components/shared/StarRating";
import type { Review } from "@/types";
import type { AxiosError } from "axios";
import type { ApiError } from "@/types";

// Fix lỗi 1: Zod v4 không có invalid_type_error trên z.number()
// Dùng z.coerce.number() + superRefine để custom message
const reviewSchema = z.object({
  content: z
    .string()
    .min(10, "Nội dung tối thiểu 10 ký tự")
    .max(5000, "Nội dung tối đa 5000 ký tự")
    .trim(),
  rating: z
    .number()
    .min(1, "Vui lòng chọn số sao")
    .max(5, "Rating tối đa 5 sao"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  bookId: string;
  existingReview?: Review;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  bookId,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!existingReview;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      content: existingReview?.content ?? "",
      rating: existingReview?.rating ?? 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ReviewFormData) => {
      if (isEdit) {
        // Fix lỗi 2: cast đúng type cho update
        const payload: UpdateReviewPayload = {
          content: data.content,
          rating: data.rating,
        };
        return reviewApi.update(existingReview!.id, payload);
      } else {
        // Fix lỗi 2: build đúng CreateReviewPayload với bookId
        const payload: CreateReviewPayload = {
          bookId: bookId,
          content: data.content,
          rating: data.rating,
        };
        return reviewApi.create(payload);
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Đã cập nhật review" : "Đã đăng review");
      queryClient.invalidateQueries({ queryKey: ["reviews", bookId] });
      queryClient.invalidateQueries({ queryKey: ["book", bookId] });
      if (!isEdit) reset();
      onSuccess?.();
    },
    onError: (err: AxiosError<ApiError>) => {
      const msg =
        err.response?.data?.message ?? "Có lỗi xảy ra, vui lòng thử lại";
      toast.error(msg);
    },
  });

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
      <h4 className="font-semibold text-sm">
        {isEdit ? "Chỉnh sửa review" : "Viết review của bạn"}
      </h4>

      <form
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="space-y-4"
        noValidate
      >
        {/* Rating */}
        <div className="space-y-1.5">
          <Label>Đánh giá của bạn</Label>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <StarInput
                value={field.value}
                onChange={field.onChange}
                disabled={mutation.isPending}
              />
            )}
          />
          {errors.rating && (
            <p className="text-xs text-destructive" role="alert">
              {errors.rating.message}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <Label htmlFor="review-content">Nội dung</Label>
          <Textarea
            id="review-content"
            rows={5}
            placeholder="Chia sẻ cảm nhận của bạn về cuốn sách..."
            className={
              errors.content
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
            disabled={mutation.isPending}
            {...register("content")}
          />
          {errors.content && (
            <p className="text-xs text-destructive" role="alert">
              {errors.content.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={mutation.isPending}
            >
              Hủy
            </Button>
          )}
          <Button
            type="submit"
            disabled={mutation.isPending || (isEdit && !isDirty)}
          >
            {mutation.isPending
              ? "Đang gửi..."
              : isEdit
                ? "Cập nhật"
                : "Đăng review"}
          </Button>
        </div>
      </form>
    </div>
  );
}
