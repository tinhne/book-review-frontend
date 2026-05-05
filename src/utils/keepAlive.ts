const API_URL = import.meta.env.VITE_API_URL as string;

export function pingBackend() {
  // Ping nhẹ — chỉ gọi 1 endpoint GET nhỏ
  fetch(`${API_URL}/api/categories`, { method: "GET" })
    .then(() => console.log("Backend is awake"))
    .catch(() => console.log("Backend waking up..."));
}
