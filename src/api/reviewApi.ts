import { PageResponse, Review } from "@/types";
import api from "./axiosInstance";

interface ReviewParams {
  page?: number;
  size?: number;
}

export interface CreateReviewPayload {
  bookId: string;
  content: string;
  rating: number;
}

export interface UpdateReviewPayload {
  content: string;
  rating: number;
}

export const reviewApi = {
  // getByBook, create, update, delete, toggleLike

  getByBook: (bookId: string, params: ReviewParams) =>
    api.get<PageResponse<Review>>(`/api/reviews/book/${bookId}`, { params }),

  create: (data: CreateReviewPayload) => api.post("/api/reviews", data),

  update: (id: string, data: UpdateReviewPayload) =>
    api.put(`/api/reviews/${id}`, data),

  delete: (id: string) => api.delete(`/api/reviews/${id}`),

  toggleLike: (id: string) => api.post(`/api/reviews/${id}/like`),
};
