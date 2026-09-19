const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const MEDIA_BASE_URL = (import.meta.env.VITE_MEDIA_BASE_URL || "").replace(/\/$/, "");

export function resolveMediaUrl(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^(data:|blob:|https?:|\/\/)/i.test(trimmed)) return trimmed;

  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (!normalizedPath.startsWith("/uploads/")) return trimmed;

  try {
    const base = MEDIA_BASE_URL || (API_BASE_URL.startsWith("http") ? API_BASE_URL : "");
    if (!base) return normalizedPath;
    const origin = new URL(base, window.location.origin).origin;
    return `${origin}${normalizedPath}`;
  } catch {
    return trimmed;
  }
}

export default resolveMediaUrl;
