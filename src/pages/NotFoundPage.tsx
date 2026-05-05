import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <BookOpen size={60} className="text-muted-foreground/20" />
      <h1 className="text-8xl font-black text-muted-foreground/20 leading-none">
        404
      </h1>
      <h2 className="text-xl font-semibold">Trang không tồn tại</h2>
      <p className="text-muted-foreground text-sm max-w-xs">
        Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa
      </p>
      <Button asChild>
        <Link to="/">Về trang chủ</Link>
      </Button>
    </main>
  );
}
