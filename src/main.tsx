import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/authContext";
import { Toaster } from "@/components/ui/sonner";
import App from "./App";
import "./index.css";
import { pingBackend } from "./utils/keepAlive";
import BackendWakeUp from "./components/shared/BackendWakeUp";

pingBackend(); // Gọi ngay khi app khởi động để "đánh thức" backend nếu nó đang ngủ

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 phút
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BackendWakeUp>
            <App />
          </BackendWakeUp>
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
