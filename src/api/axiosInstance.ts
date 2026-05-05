import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import type { ApiError } from "@/types";

// ─── Tạo instance riêng, không dùng axios global ───────────────────────────
// Security: baseURL đọc từ env, không hardcode
// Performance: timeout 15s — tránh request treo mãi mãi gây memory leak
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor ────────────────────────────────────────────────────
// Đính JWT vào mỗi request
// Security: đọc token mỗi lần thay vì cache — tránh dùng token cũ sau logout
const onRequest = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// ─── Response interceptor ───────────────────────────────────────────────────
// Tự logout khi token hết hạn (401)
// Tránh memory leak: không lưu reference tới component state ở đây
const onResponseError = (error: AxiosError<ApiError>): Promise<never> => {
  if (error.response?.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Chỉ redirect nếu không phải đang ở trang auth
    const isAuthPage =
      window.location.pathname.startsWith("/login") ||
      window.location.pathname.startsWith("/register");
    if (!isAuthPage) {
      window.location.href = "/login";
    }
  }
  return Promise.reject(error);
};

const onResponse = (res: AxiosResponse): AxiosResponse => res;

api.interceptors.request.use(onRequest);
api.interceptors.response.use(onResponse, onResponseError);

export default api;
