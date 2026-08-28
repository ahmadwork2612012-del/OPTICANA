const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "/api"
).replace(/\/$/, "");


/* =====================================
   API REQUEST
===================================== */

async function apiRequest(
  path,
  options = {}
) {
  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,

        headers: {
          Accept:
            "application/json",

          ...(options.headers || {}),
        },
      }
    );


  let payload = null;


  try {
    payload =
      await response.json();
  } catch {
    payload = null;
  }


  if (!response.ok) {
    const error =
      new Error(
        payload?.error?.message ||
          payload?.message ||
          `Request failed with status ${response.status}`
      );

    error.status =
      response.status;

    error.code =
      payload?.error?.code ||
      "API_ERROR";

    error.details =
      payload?.error?.details ||
      null;

    throw error;
  }


  if (
    payload &&
    payload.success === false
  ) {
    const error =
      new Error(
        payload?.error?.message ||
          "API request failed"
      );

    error.status =
      response.status;

    error.code =
      payload?.error?.code ||
      "API_ERROR";

    error.details =
      payload?.error?.details ||
      null;

    throw error;
  }


  return payload?.data ?? null;
}


/* =====================================
   IMAGE NORMALIZER
===================================== */

function normalizeImage(
  image
) {
  if (
    typeof image ===
    "string"
  ) {
    return image;
  }


  return (
    image?.url ||
    null
  );
}


/* =====================================
   PRODUCT NORMALIZER
===================================== */

function normalizeProduct(
  product
) {
  if (!product) {
    return null;
  }


  const rawImages =
    Array.isArray(
      product.images
    )
      ? product.images
      : [];


  const images =
    rawImages
      .map(
        normalizeImage
      )
      .filter(Boolean);


  const mainImage =
    normalizeImage(
      product.image
    ) ||
    images[0] ||
    null;


  /* =================================
     PRICING
  ================================= */

  const sellingPrice =
    Number(
      product.price ??
        product.sellingPrice ??
        0
    );


  const purchasePrice =
    Number(
      product.purchasePrice ??
        0
    );


  const oldPrice =
    product.oldPrice ===
        "" ||
    product.oldPrice ==
      null
      ? null
      : Number(
          product.oldPrice
        );


  /* =================================
     INVENTORY
  ================================= */

  const stock =
    Number(
      product.stock ??
        0
    );


  const reorderLevel =
    Number(
      product.reorderLevel ??
        0
    );


  /* =================================
     NORMALIZED PRODUCT
  ================================= */

  return {
    ...product,


    /* -------------------------------
       IDENTITY
    -------------------------------- */

    id:
      product.id ||
      null,

    sku:
      product.sku ||
      "",

    name:
      product.name ||
      "",

    slug:
      product.slug ||
      "",


    /* -------------------------------
       CATEGORY
    -------------------------------- */

    category:
      typeof product.category ===
      "string"
        ? product.category
        : product.category?.name ||
          "",


    /* -------------------------------
       CONTENT
    -------------------------------- */

    description:
      product.description ||
      "",


    /* -------------------------------
       PRICING
       STORE STANDARD = price
    -------------------------------- */

    price:
      Number.isFinite(
        sellingPrice
      )
        ? sellingPrice
        : 0,

    sellingPrice:
      Number.isFinite(
        sellingPrice
      )
        ? sellingPrice
        : 0,

    purchasePrice:
      Number.isFinite(
        purchasePrice
      )
        ? purchasePrice
        : 0,

    oldPrice:
      Number.isFinite(
        oldPrice
      )
        ? oldPrice
        : null,


    /* -------------------------------
       INVENTORY
    -------------------------------- */

    stock:
      Number.isFinite(
        stock
      )
        ? Math.max(
            0,
            stock
          )
        : 0,

    reorderLevel:
      Number.isFinite(
        reorderLevel
      )
        ? Math.max(
            0,
            reorderLevel
          )
        : 0,


    /* -------------------------------
       MEDIA
    -------------------------------- */

    image:
      mainImage,

    images:
      images,


    /* -------------------------------
       ATTRIBUTES
    -------------------------------- */

    color:
      product.color ||
      null,

    material:
      product.material ||
      null,

    size:
      product.size ||
      null,


    /* -------------------------------
       STORE STATE
    -------------------------------- */

    status:
      product.status ||
      null,

    showOnStore:
      product.showOnStore !==
      false,

    isPublished:
      product.status ===
      "PUBLISHED",

    featured:
      product.featured ===
      true,

    isNew:
      product.isNew ===
      true,

    isSale:
      product.isSale ===
      true,


    /* -------------------------------
       RATING
    -------------------------------- */

    rating:
      Math.min(
        5,
        Math.max(
          0,
          Number(
            product.rating ||
              0
          )
        )
      ),

    ratingCount:
      Math.max(
        0,
        Number(
          product.ratingCount ||
            0
        )
      ),


    /* -------------------------------
       DATES
    -------------------------------- */

    createdAt:
      product.createdAt ||
      null,

    updatedAt:
      product.updatedAt ||
      null,
  };
}


/* =====================================
   STORE PRODUCTS
===================================== */

export async function getProducts() {
  const data =
    await apiRequest(
      "/products"
    );


  return Array.isArray(
    data
  )
    ? data
        .map(
          normalizeProduct
        )
        .filter(Boolean)
    : [];
}


/* =====================================
   GET PRODUCT BY ID
===================================== */

export async function getProductById(
  id
) {
  if (!id) {
    return null;
  }


  try {
    const data =
      await apiRequest(
        `/products/${encodeURIComponent(
          id
        )}`
      );


    return normalizeProduct(
      data
    );

  } catch (error) {
    if (
      error?.status ===
      404
    ) {
      return null;
    }


    throw error;
  }
}


/* =====================================
   OFFERS
===================================== */

export async function getOffers() {
  const products =
    await getProducts();


  return products.filter(
    (product) => {
      const price =
        Number(
          product.price ||
            0
        );


      const oldPrice =
        Number(
          product.oldPrice ||
            0
        );


      return (
        product.isSale ===
          true &&
        oldPrice >
          price &&
        product.stock >
          0
      );
    }
  );
}


/* =====================================
   NEW PRODUCTS
===================================== */

export async function getNewProducts() {
  const products =
    await getProducts();


  return products.filter(
    (product) =>
      product.isNew ===
      true
  );
}


/* =====================================
   FEATURED PRODUCTS
===================================== */

export async function getFeaturedProducts() {
  const products =
    await getProducts();


  return products.filter(
    (product) =>
      product.featured ===
      true
  );
}


/* =====================================
   PRODUCT CATEGORIES
===================================== */

export async function getProductCategories() {
  const products =
    await getProducts();


  const categories =
    new Map();


  products.forEach(
    (product) => {
      const name =
        product.category?.trim();


      if (!name) {
        return;
      }


      if (
        !categories.has(
          name
        )
      ) {
        categories.set(
          name,
          {
            name,

            count:
              0,

            image:
              product.image ||
              null,
          }
        );
      }


      const category =
        categories.get(
          name
        );


      category.count +=
        1;


      if (
        !category.image &&
        product.images?.length
      ) {
        category.image =
          product.images[0] ||
          null;
      }
    }
  );


  return Array.from(
    categories.values()
  );
}


/* =====================================
   SEARCH
===================================== */

export async function searchProducts(
  query
) {
  const value =
    String(
      query || ""
    )
      .trim()
      .toLowerCase();


  if (!value) {
    return [];
  }


  const products =
    await getProducts();


  return products.filter(
    (product) => {
      const fields = [
        product.name,
        product.sku,
        product.category,
        product.description,
        product.color,
        product.material,
        product.size,
      ];


      return fields.some(
        (field) =>
          String(
            field || ""
          )
            .toLowerCase()
            .includes(
              value
            )
      );
    }
  );
}


/* =====================================
   SEARCH LIMITED
===================================== */

export async function searchProductsLimited(
  query,
  limit = 12
) {
  const results =
    await searchProducts(
      query
    );


  return results.slice(
    0,
    Math.max(
      0,
      Number(
        limit
      ) || 0
    )
  );
}


/* =====================================
   SUGGESTIONS
===================================== */

export async function getSearchSuggestions(
  query,
  limit = 6
) {
  const results =
    await searchProducts(
      query
    );


  return results
    .slice(
      0,
      Math.max(
        0,
        Number(
          limit
        ) || 0
      )
    )
    .map(
      (product) => ({
        id:
          product.id,

        name:
          product.name,

        image:
          product.image,

        price:
          product.price,

        oldPrice:
          product.oldPrice,

        category:
          product.category,

        slug:
          product.slug,
      })
    );
}


/* =====================================
   DEFAULT EXPORT
===================================== */

export default {
  getProducts,

  getProductById,

  getOffers,

  getNewProducts,

  getFeaturedProducts,

  getProductCategories,

  searchProducts,

  searchProductsLimited,

  getSearchSuggestions,
};