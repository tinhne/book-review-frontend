import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { bookApi } from "@/api/bookApi";
import { categoryApi } from "@/api/categoryApi";
import { useDebounce } from "@/hooks/useDebounce";
import BookGrid from "@/components/book/BookGrid";
import Pagination from "@/components/shared/Pagination";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types";

export default function HomePage() {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  // Debounce 400ms — không gọi API mỗi keystroke
  // Performance: giảm số request đáng kể khi user gõ nhanh
  const search = useDebounce(searchInput, 400);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const r = await categoryApi.getCategories();
      const raw = r.data as unknown;

      // Log để debug — xóa sau khi fix xong
      console.log("categories raw response:", raw);

      // Xử lý cả 2 trường hợp backend trả về
      if (Array.isArray(raw)) return raw as Category[];

      // Trường hợp backend wrap trong { content: [...] }
      if (raw && typeof raw === "object" && "content" in raw) {
        return (raw as { content: Category[] }).content;
      }

      // Fallback — tránh crash
      return [] as Category[];
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["books", page, search, categoryId, sortBy],
    queryFn: () =>
      bookApi
        .getBooks({
          page,
          size: 12,
          search: search || undefined,
          categoryId: categoryId || undefined,
          sortBy,
          sortDir: "desc",
        })
        .then((r) => r.data),
    // placeholderData: giữ data cũ khi đổi trang
    // Tránh flash loading khi chuyển trang
    placeholderData: (prev) => prev,
  });

  const handleCategoryChange = (id: string) => {
    setCategoryId(id);
    setPage(0);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setPage(0);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      {/* Hero section */}
      <section
        className="text-center space-y-4 py-6"
        aria-label="Tìm kiếm sách"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Khám phá thế giới <span className="text-primary">sách</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Đọc review thực tế từ cộng đồng độc giả
        </p>

        {/* Search input */}
        <div className="relative max-w-lg mx-auto">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            size={16}
            aria-hidden
          />
          <Input
            className="pl-9 pr-9 h-12 text-base"
            placeholder="Tìm theo tên sách hoặc tác giả..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(0);
            }}
            aria-label="Tìm kiếm sách"
          />
          {/* Nút xóa search */}
          {searchInput && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleClearSearch}
              aria-label="Xóa tìm kiếm"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </section>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b pb-4">
        <div
          className="flex items-center gap-2 flex-wrap"
          role="group"
          aria-label="Lọc theo thể loại"
        >
          <SlidersHorizontal
            size={15}
            className="text-muted-foreground shrink-0"
          />

          <Button
            variant={!categoryId ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange("")}
          >
            Tất cả
          </Button>

          {categories?.map((cat) => (
            <Button
              key={cat.id}
              variant={categoryId === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Sort */}
        <select
          className="text-sm border rounded-md px-3 py-1.5 bg-background cursor-pointer outline-none focus:ring-2 focus:ring-ring"
          value={sortBy}
          onChange={handleSortChange}
          aria-label="Sắp xếp theo"
        >
          <option value="createdAt">Mới nhất</option>
          <option value="averageRating">Đánh giá cao nhất</option>
          <option value="reviewCount">Nhiều review nhất</option>
          <option value="title">Tên A-Z</option>
        </select>
      </div>

      {/* Search result info */}
      {search && data && (
        <p className="text-sm text-muted-foreground -mt-4" role="status">
          Kết quả cho <strong className="text-foreground">"{search}"</strong>:{" "}
          {data.totalElements.toLocaleString("vi-VN")} sách
        </p>
      )}

      {/* Content */}
      {isLoading && <LoadingSpinner />}

      {isError && (
        <p className="text-center text-destructive py-10" role="alert">
          Có lỗi xảy ra, vui lòng thử lại
        </p>
      )}

      {data && <BookGrid books={data.content} />}

      {/* Pagination */}
      {data && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          onChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}
