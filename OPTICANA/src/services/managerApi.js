import { compressImage } from "../utils/compressImage";
import { resolveMediaUrl } from "../utils/mediaUrl";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
// Must match MAX_IMAGE_BYTES in the API's storage service.
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/*
  Session storage:
  - The API keeps the session in an HttpOnly cookie that page scripts cannot
    read. Only the signed-in user's name/role is remembered here, to know
    whether to show the dashboard.
  - Browsers that block the API's cross-site cookie (Safari), or an API that
    does not set it yet, fall back to a Bearer token in sessionStorage, which
    is cleared when the tab closes (never localStorage).
*/
const USER_KEY = "opticana-manager-user";
const TOKEN_KEY = "opticana-manager-token";
const LEGACY_AUTH_KEY = "opticana-manager-auth";

function readJson(storage, key) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// One-time move away from the old localStorage token.
(function migrateLegacySession() {
  try {
    const legacy = readJson(window.localStorage, LEGACY_AUTH_KEY);
    if (!legacy) return;
    if (legacy.user) window.localStorage.setItem(USER_KEY, JSON.stringify(legacy.user));
    if (legacy.token) window.sessionStorage.setItem(TOKEN_KEY, legacy.token);
    window.localStorage.removeItem(LEGACY_AUTH_KEY);
  } catch {
    // Storage unavailable (private mode); the user simply signs in again.
  }
})();

function getFallbackToken() {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setFallbackToken(token) {
  try {
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore: without storage the session lasts for this page only.
  }
}

function saveUser(user) {
  try {
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(USER_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}

function clearSession() {
  saveUser(null);
  setFallbackToken(null);
}

async function request(path, options = {}) {
  const { withToken = true, ...fetchOptions } = options;
  const headers = {
    Accept: "application/json",
    // Required by the API for cookie-authenticated writes (CSRF check).
    "X-Opticana-Csrf": "1",
    ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
    ...(fetchOptions.headers || {}),
  };
  const token = withToken ? getFallbackToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
    body: fetchOptions.body ? JSON.stringify(fetchOptions.body) : undefined,
  });

  let data = null;
  try { data = await response.json(); } catch {}

  if (response.status === 401 && withToken) {
    clearSession();
  }

  if (!response.ok || data?.success === false) {
    const error = new Error(data?.error?.message || data?.message || "تعذر تنفيذ العملية");
    error.status = response.status;
    error.code = data?.error?.code || "API_ERROR";
    throw error;
  }
  return data?.data ?? null;
}

export async function managerLogin(email, password) {
  const result = await request("/auth/login", {
    method: "POST",
    withToken: false,
    body: { email: String(email || "").trim().toLowerCase(), password },
  });

  const role = result?.user?.role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
    await managerLogout();
    throw new Error("هذا الحساب لا يملك صلاحية إدارة المنتجات.");
  }

  // Use the HttpOnly cookie when the browser accepted it; otherwise keep the
  // token for this tab only.
  let cookieWorks = false;
  try {
    await request("/auth/me", { withToken: false });
    cookieWorks = true;
  } catch {
    cookieWorks = false;
  }
  setFallbackToken(cookieWorks ? null : result.token);
  saveUser(result.user);
  return result.user;
}

export async function managerLogout() {
  try {
    await request("/auth/logout", { method: "POST", withToken: false });
  } catch {
    // An older API without /auth/logout: clearing local state is enough.
  }
  clearSession();
}

export function getManagerSession() {
  const user = readJson(window.localStorage, USER_KEY);
  return user ? { user } : null;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Uploads straight from the browser to R2 using a short-lived signed URL, so
// the image never goes through the API (Vercel caps request bodies at 4.5 MB).
// Without R2 configured it falls back to a data URL that the API stores on its
// local disk, but only in development: a deployed API cannot store files and
// Vercel rejects such large requests without CORS headers, which the browser
// only reports as "Failed to fetch".
export async function uploadManagerImage(file, folder = "products") {
  const blob = await compressImage(file);
  if (blob.size > MAX_UPLOAD_BYTES) {
    const error = new Error("حجم الصورة كبير جدًا حتى بعد الضغط.");
    error.code = "MEDIA_TOO_LARGE";
    throw error;
  }

  let target;
  try {
    target = await request("/admin/media/upload-url", {
      method: "POST",
      body: { mimeType: blob.type, size: blob.size, folder },
    });
  } catch (error) {
    if (error.code === "MEDIA_STORAGE_NOT_CONFIGURED") {
      if (import.meta.env.DEV) return blobToDataUrl(blob);
      const setupError = new Error("رفع الصور غير مفعّل على السيرفر بعد: يجب إضافة متغيرات R2 في إعدادات مشروع الـ API على Vercel.");
      setupError.code = error.code;
      throw setupError;
    }
    throw error;
  }

  const response = await fetch(target.uploadUrl, {
    method: "PUT",
    headers: target.headers,
    body: blob,
  });
  if (!response.ok) {
    const error = new Error("تعذر رفع الصورة، حاول مرة أخرى.");
    error.status = response.status;
    error.code = "MEDIA_UPLOAD_FAILED";
    throw error;
  }
  return target.publicUrl;
}

export async function getManagerProducts() {
  const products = await request("/admin/products");
  return Array.isArray(products) ? products.map(normalizeProduct) : [];
}

export async function getManagerCategories() {
  const categories = await request("/categories/admin");
  return Array.isArray(categories) ? categories : [];
}

export async function createManagerProduct(product) {
  const payload = buildPayload(product, true);
  const data = await request("/admin/products", { method: "POST", body: payload });
  return normalizeProduct(data);
}

export async function updateManagerProduct(id, product) {
  const payload = buildPayload(product, false);
  const data = await request(`/admin/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: payload,
  });
  return normalizeProduct(data);
}

export async function archiveManagerProduct(id) {
  return request(`/admin/products/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// The existing PATCH endpoint is deliberately used for visibility. DELETE is
// reserved for the explicit destructive action in the management interface.
export async function setManagerProductVisibility(product, visible) {
  return updateManagerProduct(product.id, {
    ...product,
    publish: visible,
  });
}

export async function createManagerCategory(category) {
  return request("/categories/admin", { method: "POST", body: category });
}

export async function deleteManagerCategory(id) {
  return request(`/categories/admin/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function deleteManagerCategoryWithProducts(id) {
  return request(`/categories/admin/${encodeURIComponent(id)}/with-products`, { method: "DELETE" });
}

export async function getManagerReviews() {
  const reviews = await request("/reviews/admin");
  return Array.isArray(reviews) ? reviews : [];
}

export async function updateManagerReviewStatus(id, status, featured = false) {
  return request(`/reviews/admin/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { status, featured } });
}

export async function deleteManagerReview(id) {
  return request(`/reviews/admin/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function getManagerStoreData() {
  return request("/admin/manager/store-data");
}

export async function updateManagerStoreSetting(key, value) {
  return request(`/admin/manager/settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: { value },
  });
}

export async function updateManagerStoreContent(key, value) {
  return request(`/admin/manager/content/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: { value },
  });
}

export async function getManagerRecentOrders(range = "24h") {
  const params = new URLSearchParams({ range });
  const orders = await request(`/admin/manager/orders?${params.toString()}`);
  return Array.isArray(orders) ? orders : [];
}

export async function updateManagerOrderStatus(id, status) {
  return request(`/admin/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: { status },
  });
}

function slugify(value = "") {
  const slug = String(value).trim().toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `product-${Date.now()}`;
}

function buildPayload(product, isCreate) {
  const price = Number(product.price);
  const initialStock = Math.max(0, Math.floor(Number(product.initialStock || 0)));

  const images = (Array.isArray(product.images) ? product.images : [])
    .filter(Boolean)
    .map((image, index) => ({
      url: image.url,
      altText: image.altText || product.name || "OPTICANA",
      isPrimary: index === 0,
      sortOrder: index,
    }));

  const payload = {
    sku: String(product.sku || "").trim(),
    name: String(product.name || "").trim(),
    nameEn: String(product.nameEn || "").trim() || undefined,
    slug: slugify(product.slug || product.name),
    description: String(product.description || "").trim(),
    descriptionEn: String(product.descriptionEn || "").trim() || undefined,
    price,
    oldPrice: product.oldPrice === "" || product.oldPrice == null ? null : Number(product.oldPrice),
    purchasePrice: product.purchasePrice === "" || product.purchasePrice == null ? null : Number(product.purchasePrice),
    reorderLevel: Math.max(0, Math.floor(Number(product.reorderLevel || 0))),
    color: String(product.color || "").trim() || undefined,
    material: String(product.material || "").trim() || undefined,
    size: String(product.size || "").trim() || undefined,
    status: product.publish ? "PUBLISHED" : "DRAFT",
    showOnStore: product.publish === true,
    featured: product.featured === true,
    isNew: product.isNew === true,
    isSale: product.isSale === true,
    categoryId: product.categoryId || null,
    images,
  };

  if (isCreate) payload.initialStock = initialStock;
  return payload;
}

function normalizeProduct(product) {
  if (!product) return null;
  return {
    ...product,
    image: resolveMediaUrl(product.image || product.images?.[0]?.url || null),
    images: Array.isArray(product.images)
      ? product.images.map((image) => ({ ...image, url: resolveMediaUrl(image.url) }))
      : [],
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    oldPrice: product.oldPrice == null ? null : Number(product.oldPrice),
    purchasePrice: product.purchasePrice == null ? null : Number(product.purchasePrice),
  };
}
