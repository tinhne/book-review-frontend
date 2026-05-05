import { AuthResponse, User } from "@/types";
import api from "./axiosInstance";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export const authApi = {
  login: (data: LoginPayload) =>
    api.post<AuthResponse>("/api/auth/login", data),
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>("/api/auth/register", data),
  getMe: () => api.get<User>("/api/auth/me"),
};
