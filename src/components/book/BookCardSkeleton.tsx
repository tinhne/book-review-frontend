import { Card, CardContent } from "@/components/ui/card";

// Khung giữ chỗ cùng tỉ lệ với BookCard (bìa 2:3) để tránh layout nhảy khi dữ liệu về
export function BookCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden" aria-hidden="true">
      <div className="aspect-[2/3] bg-muted animate-pulse" />
      <CardContent className="p-3 space-y-2">
        <div className="h-4 w-16 rounded-full bg-muted animate-pulse" />
        <div className="h-4 w-full rounded bg-muted animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="h-3 w-20 rounded bg-muted animate-pulse" />
          <div className="h-3 w-10 rounded bg-muted animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export function BookGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4"
      role="status"
      aria-label="Đang tải danh sách sách"
    >
      {Array.from({ length: count }, (_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}
