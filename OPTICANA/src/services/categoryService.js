import { resolveMediaUrl } from "../utils/mediaUrl";
import { registerCatalogTranslation } from "../context/LanguageContext";
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "/api"
).replace(/\/$/, "");


/* =====================================
   REQUEST
===================================== */

async function request(
  path
) {
  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        method: "GET",

        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );


  let data = null;


  try {
    data =
      await response.json();
  } catch {
    data = null;
  }


  if (
    !response.ok ||
    data?.success === false
  ) {
    const error =
      new Error(
        data?.error?.message ||
          "تعذر تحميل التصنيفات"
      );


    error.code =
      data?.error?.code ||
      "UNKNOWN_ERROR";


    error.statusCode =
      response.status;


    throw error;
  }


  return data?.data;
}


/* =====================================
   NORMALIZER
===================================== */

function normalizeCategory(
  category
) {
  if (!category) {
    return null;
  }

  registerCatalogTranslation(category.name, category.nameEn);
  registerCatalogTranslation(category.description, category.descriptionEn);


  return {
    id:
      category.id ||
      null,

    name:
      category.name ||
      "",

    slug:
      category.slug ||
      "",

    description:
      category.description ||
      "",

    image:
      resolveMediaUrl(category.imageUrl) ||
      null,

    sortOrder:
      Number(
        category.sortOrder ||
          0
      ),

    isActive:
      category.isActive ===
      true,

    showOnStore:
      category.showOnStore ===
      true,

    productCount:
      Number(
        category.productCount ||
          0
      ),

    createdAt:
      category.createdAt ||
      null,

    updatedAt:
      category.updatedAt ||
      null,
  };
}


/* =====================================
   PUBLIC STORE CATEGORIES
===================================== */

export async function getStoreCategories() {
  const data =
    await request(
      "/categories"
    );


  return Array.isArray(
    data
  )
    ? data
        .map(
          normalizeCategory
        )
        .filter(Boolean)
    : [];
}


/* =====================================
   DEFAULT
===================================== */

export default {
  getStoreCategories,
};
