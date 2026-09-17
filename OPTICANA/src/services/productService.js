import { resolveMediaUrl } from "../utils/mediaUrl";
import { registerCatalogTranslation } from "../context/LanguageContext";
import { parseProductDescription } from "../utils/productExtraFields";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "/api"
).replace(/\/$/, "");

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { Accept: "application/json", ...(options.headers || {}) },
  });
  let payload = null;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.error?.message || payload?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.code = payload?.error?.code || "API_ERROR";
    error.details = payload?.error?.details || null;
    throw error;
  }
  return payload?.data ?? null;
}

function normalizeImage(image) {
  if (typeof image === "string") return resolveMediaUrl(image);
  return resolveMediaUrl(image?.url) || null;
}

function normalizeProduct(product) {
  if (!product) return null;
  registerCatalogTranslation(product?.name, product?.nameEn);
  registerCatalogTranslation(product?.description, product?.descriptionEn);
  registerCatalogTranslation(product?.category, product?.categoryEn);
  const rawImages = Array.isArray(product.images) ? product.images : [];
  const images = rawImages.map(normalizeImage).filter(Boolean);
  const mainImage = normalizeImage(product.image) || images[0] || null;
  const sellingPrice = Number(product.price ?? product.sellingPrice ?? 0);
  const purchasePrice = Number(product.purchasePrice ?? 0);
  const oldPrice = product.oldPrice === "" || product.oldPrice == null ? null : Number(product.oldPrice);
  const stock = Number(product.stock ?? 0);
  const reorderLevel = Number(product.reorderLevel ?? 0);
  const parsedDescription = parseProductDescription(product.description || "");
  return {
    ...product,
    id: product.id || null,
    sku: product.sku || "",
    name: product.name || "",
    slug: product.slug || "",
    category: typeof product.category === "string" ? product.category : product.category?.name || "",
    description: parsedDescription.description,
    extraFields: parsedDescription.extraFields,
    price: Number.isFinite(sellingPrice) ? sellingPrice : 0,
    sellingPrice: Number.isFinite(sellingPrice) ? sellingPrice : 0,
    purchasePrice: Number.isFinite(purchasePrice) ? purchasePrice : 0,
    oldPrice: Number.isFinite(oldPrice) ? oldPrice : null,
    stock: Number.isFinite(stock) ? Math.max(0, stock) : 0,
    reorderLevel: Number.isFinite(reorderLevel) ? Math.max(0, reorderLevel) : 0,
    image: mainImage,
    images,
    color: product.color || null,
    material: product.material || null,
    size: product.size || null,
    status: product.status || null,
    showOnStore: product.showOnStore !== false,
    isPublished: product.status === "PUBLISHED",
    featured: product.featured === true,
    isNew: product.isNew === true,
    isSale: product.isSale === true,
    rating: Math.min(5, Math.max(0, Number(product.rating || 0))),
    ratingCount: Math.max(0, Number(product.ratingCount || 0)),
    createdAt: product.createdAt || null,
    updatedAt: product.updatedAt || null,
  };
}

export async function getProducts() {
  const data = await apiRequest("/products");
  return Array.isArray(data) ? data.map(normalizeProduct).filter(Boolean) : [];
}

export async function getProductById(id) {
  if (!id) return null;
  try { return normalizeProduct(await apiRequest(`/products/${encodeURIComponent(id)}`)); }
  catch (error) { if (error?.status === 404) return null; throw error; }
}

export async function getOffers() {
  const products = await getProducts();
  return products.filter(product => product.isSale === true && Number(product.oldPrice || 0) > Number(product.price || 0) && product.stock > 0);
}

export async function getNewProducts() {
  return (await getProducts()).filter(product => product.isNew === true);
}

export async function getFeaturedProducts() {
  return (await getProducts()).filter(product => product.featured === true);
}

export async function getProductCategories() {
  const categories = new Map();
  (await getProducts()).forEach(product => {
    const name = product.category?.trim();
    if (!name) return;
    if (!categories.has(name)) categories.set(name, { name, count: 0, image: product.image || null });
    const category = categories.get(name);
    category.count += 1;
    if (!category.image && product.images?.length) category.image = product.images[0] || null;
  });
  return Array.from(categories.values());
}

export async function searchProducts(query) {
  const value = String(query || "").trim().toLowerCase();
  if (!value) return [];
  const products = await getProducts();
  return products.filter(product => [product.name, product.sku, product.category, product.description, product.color, product.material, product.size].some(field => String(field || "").toLowerCase().includes(value)));
}

export async function searchProductsLimited(query, limit = 12) {
  return (await searchProducts(query)).slice(0, Math.max(0, Number(limit) || 0));
}

export async function getSearchSuggestions(query, limit = 6) {
  return (await searchProducts(query)).slice(0, Math.max(0, Number(limit) || 0)).map(product => ({ id: product.id, name: product.name, image: product.image, price: product.price, oldPrice: product.oldPrice, category: product.category, slug: product.slug }));
}

export default { getProducts, getProductById, getOffers, getNewProducts, getFeaturedProducts, getProductCategories, searchProducts, searchProductsLimited, getSearchSuggestions };
