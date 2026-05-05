import { Book, BookDetail, PageResponse } from "@/types";
import api from "./axiosInstance";

export interface BookParams {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface CreateBookPayload {
  title: string;
  author: string;
  ibsn: string;
  description: string;
  coverUrl: string;
  categoryId: string;
}

export const bookApi = {
  getBooks: (params: BookParams) =>
    api.get<PageResponse<Book>>("/api/books", { params }),

  getBook: (id: string) => api.get<BookDetail>(`/api/books/${id}`),
  createBook: (data: CreateBookPayload) =>
    api.post<BookDetail>("/api/books", data),
  updateBook: (id: string, data: CreateBookPayload) =>
    api.put<BookDetail>(`/api/books/${id}`, data),
  deleteBook: (id: string) => api.delete(`/api/books/${id}`),
};
