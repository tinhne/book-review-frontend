import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { bookApi } from "@/api/bookApi";
import { categoryApi } from "@/api/categoryApi";
import { useDebounce } from "@/hooks/useDebounce";
import BookGrid from "@/components/book/BookGrid";
import Pagination from "@/components/shared/Pagination";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Category, PageResponse, Book } from "@/types";

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Đọc trạng thái từ URL
  const page = Number(searchParams.get("page") || "0");
  const categoryId = searchParams.get("category") || "";
  const sortBy = searchParams.get("sort") || "createdAt";
  const urlSearch = searchParams.get("search") || "";

  // 2. Local state cho ô input
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Dùng ref để theo dõi giá trị cuối cùng đã đồng bộ lên URL, tránh vòng lặp feedback
  const lastSyncedSearch = useRef(urlSearch);

  // Hàm helper cập nhật URL
  const updateUrl = useCallback(
    (updates: Record<string, string | number | undefined | null>) => {
      const nextParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          nextParams.delete(key);
        } else {
          nextParams.set(key, String(value));
        }
      });
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams],
  );

  // EFFECT 1: Cập nhật URL khi người dùng ngừng gõ (Input -> URL)
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      lastSyncedSearch.current = debouncedSearch; // Đánh dấu đây là update từ nội bộ
      updateUrl({ search: debouncedSearch, page: 0 });
    }
  }, [debouncedSearch, urlSearch, updateUrl]);

  // EFFECT 2: Đồng bộ ngược lại khi nhấn Back/Forward (URL -> Input)
  // Sửa lỗi: Synchronous setState warning bằng cách kiểm tra ref
  useEffect(() => {
    if (urlSearch !== lastSyncedSearch.current) {
      setSearchInput(urlSearch);
      lastSyncedSearch.current = urlSearch;
    }
  }, [urlSearch]);

  // Query lấy danh sách Categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const r = await categoryApi.getCategories();
      const raw = r.data as unknown;
      if (Array.isArray(raw)) return raw as Category[];
      if (raw && typeof raw === "object" && "content" in raw) {
        return (raw as { content: Category[] }).content;
      }
      return [] as Category[];
    },
    staleTime: Infinity,
  });

  // Query lấy danh sách Books
  const { data, isLoading, isError } = useQuery({
    queryKey: ["books", page, urlSearch, categoryId, sortBy],
    queryFn: () =>
      bookApi
        .getBooks({
          page,
          size: 12,
          search: urlSearch || undefined,
          categoryId: categoryId || undefined,
          sortBy,
          sortDir: "desc",
        })
        .then((r) => r.data as PageResponse<Book>),
    placeholderData: (prev) => prev,
  });

  const handleCategoryChange = (id: string) =>
    updateUrl({ category: id, page: 0 });
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateUrl({ sort: e.target.value, page: 0 });

  const handleClearSearch = () => {
    setSearchInput("");
    lastSyncedSearch.current = "";
    updateUrl({ search: "", page: 0 });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <section className="text-center space-y-4 py-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Khám phá thế giới <span className="text-primary">sách</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Đọc review thực tế từ cộng đồng độc giả
        </p>

        <div className="relative max-w-lg mx-auto">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <Input
            className="pl-9 pr-9 h-12 text-base"
            placeholder="Tìm theo tên sách hoặc tác giả..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={handleClearSearch}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </section>

      <div className="flex items-center justify-between gap-4 flex-wrap border-b pb-4">
        <div className="flex items-center gap-2 flex-wrap">
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

        <select
          className="text-sm border rounded-md px-3 py-1.5 bg-background cursor-pointer outline-none focus:ring-2 focus:ring-ring"
          value={sortBy}
          onChange={handleSortChange}
        >
          <option value="createdAt">Mới nhất</option>
          <option value="averageRating">Đánh giá cao nhất</option>
          <option value="reviewCount">Nhiều review nhất</option>
          <option value="title">Tên A-Z</option>
        </select>
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && (
        <p className="text-center text-destructive py-10">
          Có lỗi xảy ra, vui lòng thử lại
        </p>
      )}
      {data && <BookGrid books={data.content} />}

      {data && data.totalPages > 1 && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          onChange={(p) => {
            updateUrl({ page: p });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}
