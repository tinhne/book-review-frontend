import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { bookApi } from "@/api/bookApi";
import { categoryApi } from "@/api/categoryApi";
import { useDebounce } from "@/hooks/useDebounce";
import BookGrid from "@/components/book/BookGrid";
import Pagination from "@/components/shared/Pagination";
import ErrorState from "@/components/shared/ErrorState";
import { BookGridSkeleton } from "@/components/book/BookCardSkeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Category, PageResponse, Book } from "@/types";

// Mỗi tiêu chí sắp xếp đi kèm chiều sắp xếp riêng (tên sách cần A→Z, còn lại giảm dần)
const SORT_OPTIONS = [
  { value: "createdAt", label: "Mới nhất", dir: "desc" },
  { value: "averageRating", label: "Đánh giá cao nhất", dir: "desc" },
  { value: "reviewCount", label: "Nhiều đánh giá nhất", dir: "desc" },
  { value: "title", label: "Tên A–Z", dir: "asc" },
] as const;

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

  const sortDir =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.dir ?? "desc";

  // Query lấy danh sách Books
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["books", page, urlSearch, categoryId, sortBy],
    queryFn: () =>
      bookApi
        .getBooks({
          page,
          size: 12,
          search: urlSearch || undefined,
          categoryId: categoryId || undefined,
          sortBy,
          sortDir,
        })
        .then((r) => r.data as PageResponse<Book>),
    placeholderData: (prev) => prev,
  });

  const hasFilters = Boolean(urlSearch || categoryId);

  const handleCategoryChange = (id: string) =>
    updateUrl({ category: id, page: 0 });
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateUrl({ sort: e.target.value, page: 0 });

  const handleClearSearch = () => {
    setSearchInput("");
    lastSyncedSearch.current = "";
    updateUrl({ search: "", page: 0 });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    lastSyncedSearch.current = "";
    updateUrl({ search: "", category: "", page: 0 });
  };

  const chipClass = (active: boolean) =>
    cn(
      "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <section className="text-center space-y-4 py-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Khám phá thế giới <span className="text-primary">sách</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Đọc đánh giá thực tế từ cộng đồng độc giả
        </p>

        <div className="relative max-w-lg mx-auto">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            size={18}
            aria-hidden="true"
          />
          <Input
            type="search"
            className="pl-10 pr-10 h-12 text-base rounded-full shadow-sm [&::-webkit-search-cancel-button]:hidden"
            placeholder="Tìm theo tên sách hoặc tác giả..."
            aria-label="Tìm theo tên sách hoặc tác giả"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={handleClearSearch}
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </section>

      <div className="space-y-4 border-b pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Thể loại: một hàng cuộn ngang thay vì xuống nhiều dòng */}
          <div
            className="relative min-w-0 md:flex-1 [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]"
          >
            <div
              className="flex gap-2 overflow-x-auto scrollbar-none py-1 pr-8"
              role="group"
              aria-label="Lọc theo thể loại"
            >
              <button
                type="button"
                className={chipClass(!categoryId)}
                aria-pressed={!categoryId}
                onClick={() => handleCategoryChange("")}
              >
                Tất cả
              </button>
              {categories?.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  className={chipClass(categoryId === cat.id)}
                  aria-pressed={categoryId === cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label
              htmlFor="sort-books"
              className="text-sm text-muted-foreground whitespace-nowrap"
            >
              Sắp xếp
            </label>
            <div className="relative">
              <select
                id="sort-books"
                className="h-9 appearance-none rounded-md border border-input bg-background pl-3 pr-9 text-sm font-medium cursor-pointer transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={sortBy}
                onChange={handleSortChange}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {data && (
          <p
            className="text-sm text-muted-foreground flex items-center gap-2"
            aria-live="polite"
          >
            <span>
              {data.totalElements.toLocaleString("vi-VN")} cuốn sách
              {urlSearch && (
                <>
                  {" "}
                  cho “<span className="text-foreground">{urlSearch}</span>”
                </>
              )}
            </span>
            {isFetching && !isLoading && (
              <span className="inline-flex items-center gap-1.5 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Đang cập nhật
              </span>
            )}
          </p>
        )}
      </div>

      {isLoading && <BookGridSkeleton />}
      {isError && !data && (
        <ErrorState onRetry={() => refetch()} retrying={isFetching} />
      )}
      {isError && data && (
        <p className="text-sm text-destructive" role="alert">
          Không cập nhật được kết quả mới.{" "}
          <button
            type="button"
            className="font-medium underline underline-offset-4"
            onClick={() => refetch()}
          >
            Thử lại
          </button>
        </p>
      )}
      {data && (
        <div
          className={cn(
            "transition-opacity",
            isFetching && !isLoading && "opacity-60",
          )}
        >
          <BookGrid
            books={data.content}
            hasFilters={hasFilters}
            onResetFilters={handleResetFilters}
          />
        </div>
      )}

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
