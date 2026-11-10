const SITE_ORIGIN = "https://www.opticanaa.com";
const API_ORIGIN = (
  process.env.OPTICANA_PUBLIC_API_ORIGIN ||
  "https://opticana-backend-ahmad-8996dd44.vercel.app"
).replace(/\/+$/, "");

const STATIC_PATHS = [
  "/",
  "/products",
  "/offers",
  "/about",
  "/contact",
  "/guides/choose-sunglasses.html",
  "/guides/choose-optical-frames.html",
];

function unwrapArray(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  for (const key of ["products", "items", "results"]) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function validDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString().slice(0, 10);
}

async function getPublishedProducts() {
  const response = await fetch(API_ORIGIN + "/api/products", {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error("Product API returned " + response.status);
  }

  const payload = await response.json();
  return unwrapArray(payload).filter((product) =>
    product &&
    product.id != null &&
    product.status === "PUBLISHED" &&
    product.showOnStore !== false
  );
}

export default async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    return response.status(405).end("Method Not Allowed");
  }

  let products = [];
  try {
    products = await getPublishedProducts();
  } catch (error) {
    // Keep the sitemap useful for core store pages during a temporary API issue.
    console.error("SEO sitemap product fetch failed:", error?.message || error);
  }

  const entries = STATIC_PATHS.map((path) => ({
    loc: SITE_ORIGIN + path,
    priority: path === "/"
      ? "1.0"
      : path === "/products"
        ? "0.9"
        : path.startsWith("/guides/")
          ? "0.7"
          : "0.6",
  }));

  for (const product of products) {
    const loc = SITE_ORIGIN + "/product/" + encodeURIComponent(String(product.id));
    entries.push({
      loc,
      lastmod: validDate(product.updatedAt || product.createdAt),
      priority: "0.7",
    });
  }

  const uniqueEntries = Array.from(
    new Map(entries.map((entry) => [entry.loc, entry])).values()
  );

  const urlBlocks = uniqueEntries.map((entry) => {
    const lines = [
      "  <url>",
      "    <loc>" + escapeXml(entry.loc) + "</loc>",
    ];
    if (entry.lastmod) lines.push("    <lastmod>" + entry.lastmod + "</lastmod>");
    lines.push("    <priority>" + entry.priority + "</priority>");
    lines.push("  </url>");
    return lines.join("\n");
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlBlocks.join("\n"),
    "</urlset>",
  ].join("\n");

  response.setHeader("Content-Type", "application/xml; charset=utf-8");
  response.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  response.setHeader("X-Content-Type-Options", "nosniff");

  if (request.method === "HEAD") return response.status(200).end();
  return response.status(200).send(xml);
}
