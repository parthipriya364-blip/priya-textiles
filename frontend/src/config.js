const normalizeBaseUrl = (value, fallback = "/api") => {
  if (!value) return fallback;
  return value.replace(/\/$/, "");
};

const isVercelDeployment =
  typeof window !== "undefined" && /vercel\.app$/i.test(window.location.hostname);

const DEFAULT_API_BASE = isVercelDeployment
  ? "https://priya-textiles.onrender.com/api"
  : "/api";

const DEFAULT_SOCKET_BASE = isVercelDeployment
  ? "https://priya-textiles.onrender.com"
  : typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : (typeof window !== "undefined" ? window.location.origin : "");

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_URL || DEFAULT_API_BASE,
  DEFAULT_API_BASE
);
export const SOCKET_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_SOCKET_URL || DEFAULT_SOCKET_BASE,
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
  const apiBase = import.meta.env.VITE_API_URL || DEFAULT_API_BASE;
  const origin = apiBase.replace(/\/api$/, "") || DEFAULT_SOCKET_BASE || "http://localhost:5000";

  return `${origin}/api/auth/google`;
}
