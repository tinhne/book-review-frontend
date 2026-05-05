import { BookOpen } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between flex-wrap gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-sm hover:opacity-80 transition-opacity"
        >
          <BookOpen size={15} className="text-primary" />
          BookReview
        </Link>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} BookReview. Chia sẻ đam mê đọc sách.
        </p>

        <a
          href={import.meta.env.VITE_LINK_GITHUB}
          target="_blank"
          rel="noreferrer noopener" // Security: noopener ngăn tab mới truy cập window.opener
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="GitHub"
        >
          <FaGithub size={18} />
        </a>
      </div>
    </footer>
  );
}
