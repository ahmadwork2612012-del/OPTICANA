const SITE_ORIGIN = "https://www.opticanaa.com";
const API_ORIGIN = (
  process.env.OPTICANA_PUBLIC_API_ORIGIN ||
  "https://opticana-backend-ahmad-8996dd44.vercel.app"
).replace(/\\/$/, "");
const MEDIA_ORIGIN = (
  process.env.OPTICANA_MEDIA_ORIGIN ||
  "https://media.opticanaa.com"
).replace(/\\/$/, "");

function unwrap(payload) {
  return payload?.data ?? payload ?? {};
}

function unwrapArray(payload) {
  const data = unwrap(payload);
  if (Array.isArray(data)) return data;
  for (const key of ["products", "items", "results"]) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function xml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function plainText(value) {
  return String(value ?? "")
    .replace(/<script[\\s\\S]*?<\\/script>/gi, " ")
    .replace(/<style[\\s\\S]*?<\\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\\s+/g, " ")
    .trim();
}

function currencyCode(raw) {
  const value = String(raw ?? "").trim().toUpperCase();
  if (!value || /EGP|ج\\s*\\.?م|جنيه/.test(value)) return "EGP";
  if (/SAR|ر\\s*\\.?س|ريال سعودي/.test(value)) return "SAR";
  if (/AED|د\\s*\\.?إ|درهم/.test(value)) return "AED";
  if (/USD|دولار|\\$/.test(value)) return "USD";
  if (/KWD|دينار كويتي/.test(value)) return "KWD";
  if (/QAR|ريال قطري/.test(value)) return "QAR";
  if (/BHD|دينار بحريني/.test(value)) return "BHD";
  if (/OMR|ريال عماني/.test(value)) return "OMR";
  if (/JOD|دينار أردني/.test(value)) return "JOD";
  if (/GBP|جنيه إسترليني/.test(value)) return "GBP";
  if (/EUR|يورو/.test(value)) return "EUR";
  return /^[A-Z]{3}$/.test(value) ? value : "EGP";
}

function imageUrl(candidate) {
  const raw = typeof candidate === "string" ? candidate : candidate?.url;
  if (!raw || typeof raw !== "string") return "";

  try {
    if (/^https?:\\/\\//i.test(raw)) return new URL(raw).href;
    if (raw.startsWith("//")) return `https:${raw}`;
    if (raw.startsWith("/uploads/")) return `${MEDIA_ORIGIN}${raw}`;
    if (raw.startsWith("/")) return new URL(raw, SITE_ORIGIN).href;
    return new URL(raw, SITE_ORIGIN).href;
  } catch {
    return "";
  }
}

function pickImage(product) {
  const candidates = [
    product?.image,
    ...(Array.isArray(product?.images) ? product.images : []),
  ];
  for (const candidate of candidates) {
    const resolved = imageUrl(candidate);
    if (resolved) return resolved;
  }
  return "";
}

async function fetchJson(path) {
  const response = await fetch(`${API_ORIGIN}/api${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Public API returned ${response.status} for ${path}`);
  return response.json();
}

function formatPrice(value, code) {
  return `${Number(value).toFixed(2)} ${code}`;
}

export default async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    return response.status(405).end("Method Not Allowed");
  }

  try {
    const [productsPayload, settingsPayload] = await Promise.all([
      fetchJson("/products"),
      fetchJson("/settings").catch(() => null),
    ]);

    const settings = unwrap(settingsPayload);
    const currency = currencyCode(
      settings?.general?.currency || settings?.business?.currency || "ج.م"
    );

    const products = unwrapArray(productsPayload).filter((product) => {
      const price = Number(product?.price ?? product?.sellingPrice ?? 0);
      return (
        product &&
        product.id != null &&
        product.status === "PUBLISHED" &&
        product.showOnStore !== false &&
        Number(product.stock ?? 0) > 0 &&
        Number.isFinite(price) &&
        price > 0 &&
        Boolean(String(product.name || "").trim()) &&
        Boolean(pickImage(product))
      );
    });

    const items = products.map((product) => {
      const currentPrice = Number(product.price ?? product.sellingPrice);
      const oldPrice = Number(product.oldPrice ?? 0);
      const hasSale = product.isSale === true && oldPrice > currentPrice && oldPrice > 0;
      const regularPrice = hasSale ? oldPrice : currentPrice;
      const image = pickImage(product);
      const title = plainText(product.name).slice(0, 150);
      const description = plainText(product.description || product.name).slice(0, 5000);
      const itemUrl = `${SITE_ORIGIN}/product/${encodeURIComponent(String(product.id))}`;
      const condition = ["new", "used", "refurbished"].includes(
        String(product.condition || "").toLowerCase()
      )
        ? String(product.condition).toLowerCase()
        : "new";

      return `    <item>
      <g:id>${xml(product.id)}</g:id>
      <g:title>${xml(title)}</g:title>
      <g:description>${xml(description)}</g:description>
      <g:link>${xml(itemUrl)}</g:link>
      <g:image_link>${xml(image)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${formatPrice(regularPrice, currency)}</g:price>
${hasSale ? `      <g:sale_price>${formatPrice(currentPrice, currency)}</g:sale_price>\\n` : ""}      <g:condition>${condition}</g:condition>
${product.category ? `      <g:product_type>${xml(plainText(product.category))}</g:product_type>\\n` : ""}${product.brand ? `      <g:brand>${xml(product.brand)}</g:brand>\\n` : ""}    </item>`;
    });

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>OPTICANA</title>
    <link>${SITE_ORIGIN}</link>
    <description>Public product feed for OPTICANA.</description>
${items.join("\\n")}
  </channel>
</rss>`;

    response.setHeader("Content-Type", "application/xml; charset=utf-8");
    response.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600");
    response.setHeader("X-Content-Type-Options", "nosniff");

    if (request.method === "HEAD") return response.status(200).end();
    return response.status(200).send(rss);
  } catch (error) {
    console.error("Google Merchant feed failed:", error?.message || error);
    response.setHeader("Cache-Control", "no-store");
    return response.status(503).json({
      error: "The public product feed is temporarily unavailable.",
    });
  }
}
