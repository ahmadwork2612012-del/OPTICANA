import { env } from "../config/env.js";

/*
  The dashboard session lives in an HttpOnly cookie, out of reach of page
  JavaScript. The storefront and the API are on different sites in
  production, so the cookie must be SameSite=None (and therefore Secure);
  locally both are served through the Vite proxy, so Lax over http works.
*/
export const SESSION_COOKIE = "opticana_session";
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const isProduction = env.NODE_ENV === "production";

function cookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api",
  };
}

export function setSessionCookie(res, token) {
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: SESSION_MAX_AGE_MS });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
}

export function readSessionCookie(req) {
  const header = String(req.headers?.cookie || "");
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    if (part.slice(0, index).trim() === SESSION_COOKIE) {
      try {
        return decodeURIComponent(part.slice(index + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}
