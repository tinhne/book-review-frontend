import {
  createContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  loading: false; // Không cần loading nữa vì đọc sync từ localStorage
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Đọc localStorage 1 lần khi khởi tạo — KHÔNG dùng useEffect ─────────────
// useState(initializer fn) chạy 1 lần synchronously trước render đầu tiên
// Tránh hoàn toàn vấn đề setState trong effect
function getInitialState(): AuthState {
  try {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");
    if (token && raw) {
      const user = JSON.parse(raw) as User;
      return { token, user };
    }
  } catch {
    // Data hỏng → xóa sạch
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy initializer: chạy 1 lần, đọc localStorage đồng bộ
  // Không cần loading state vì không có async operation
  const [auth, setAuth] = useState<AuthState>(getInitialState);

  const login = useCallback((token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuth({ token, user });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user: auth.user,
      token: auth.token,
      loading: false,
      isAuthenticated: !!auth.token,
      isAdmin: auth.user?.role === "ADMIN",
      login,
      logout,
    }),
    [auth, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
export type { AuthContextType };
