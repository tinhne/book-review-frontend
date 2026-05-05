import type { Category } from "@/types";
import api from "./axiosInstance";

export const categoryApi = {
  // getCategories: () => api.get<Category[]>("/api/categories"),
  getCategories: () => api.get<unknown>("/api/categories"),
  createCategory: (name: string) =>
    api.post<Category>("/api/categories", { name }),
  deleteCategory: (id: string) => api.delete(`/api/categories/${id}`),
};
