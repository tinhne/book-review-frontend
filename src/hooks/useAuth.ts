import { useContext } from "react";
import { AuthContext, type AuthContextType } from "@/context/authContext";

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng trong AuthProvider");
  return ctx;
}
