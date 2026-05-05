import { useState, useEffect } from "react";

// Generic hook — dùng được cho mọi kiểu dữ liệu
// Cleanup timeout khi unmount → tránh memory leak
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    // Cleanup: hủy timer cũ trước khi set timer mới
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
