// import axios from "axios";

// // Prefer relative URLs so Vite proxy can handle /api and /uploads in dev,
// // avoiding CORS and port mismatches.
// const API_URL = import.meta.env.VITE_API_URL || "";

// export const apiClient = axios.create({
//   baseURL: API_URL,
//   timeout: 15000
// });

// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token") || localStorage.getItem("cad_token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });





import axios from "axios";

// Prefer explicit backend URL when provided, otherwise use relative `/api`
// so Vite's dev proxy can forward requests and avoid CORS.
//
// Example (frontend/.env):
//   VITE_API_URL=http://localhost:5000/api
function normalizeBaseUrl(raw) {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return "/api";
  const noTrailing = trimmed.replace(/\/+$/, "");
  return noTrailing.endsWith("/api") ? noTrailing : `${noTrailing}/api`;
}

export const apiClient = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL),
  timeout: 15000
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("cad_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
