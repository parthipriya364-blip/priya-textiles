const normalizeBaseUrl = (value, fallback = "/api") => {
  if (!value) return fallback;
  return value.replace(/\/$/, "");
};

const DEFAULT_API_BASE = "/api";
const DEFAULT_SOCKET_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : (typeof window !== "undefined" ? window.location.origin : "");

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL, DEFAULT_API_BASE);
export const SOCKET_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_SOCKET_URL,
  DEFAULT_SOCKET_BASE
);

export function getApiUrl(path = "") {
  const base = API_BASE_URL;
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `${base}${cleanPath}`;
}

export function getSocketUrl(path = "") {
  const base = SOCKET_BASE_URL;
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `${base}${cleanPath}`;
}

export function getGoogleAuthUrl() {
  const origin = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
    : DEFAULT_SOCKET_BASE || "http://localhost:5000";

  return `${origin}/api/auth/google`;
}
