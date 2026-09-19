import prisma from "../lib/prisma.js";
import { persistDataUrl } from "./media.service.js";


function serializeCategory(category) {
  if (!category) {
    return null;
  }

  return {
    id: category.id,
    name: category.name,
    nameEn: category.nameEn || "",
    slug: category.slug,
    description: category.description || "",
    descriptionEn: category.descriptionEn || "",
    imageUrl: category.imageUrl || null,
    isActive: category.isActive === true,
    showOnStore: category.showOnStore === true,
    sortOrder: category.sortOrder,
    productCount: category._count?.products ?? undefined,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}


/* =====================================
   PUBLIC: LIST ACTIVE CATEGORIES
===================================== */

export async function getStoreCategories() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      showOnStore: true,
    },

    orderBy: {
      sortOrder: "asc",
    },
  });

  return categories.map(serializeCategory);
}


/* =====================================
   ADMIN: LIST ALL CATEGORIES
===================================== */

export async function listAdminCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return categories.map(serializeCategory);
}


/* =====================================
   ADMIN: CREATE / UPDATE / DELETE
===================================== */

export async function createCategory(data) {
  const safeData = { ...data };
  if (safeData.imageUrl) safeData.imageUrl = await persistDataUrl(safeData.imageUrl);
  const category = await prisma.category.create({ data: safeData });
  return serializeCategory(category);
}

export async function updateCategory(id, data) {
  const safeData = { ...data };
  if (safeData.imageUrl) safeData.imageUrl = await persistDataUrl(safeData.imageUrl);
  const category = await prisma.category.update({
    where: { id },
    data: safeData,
  });
  return serializeCategory(category);
}

export async function deleteCategoryOnly(id) {
  // The relation is configured with SetNull, so products remain available but
  // become uncategorized.
  const category = await prisma.category.findUnique({
    where: { id },
    select: { _count: { select: { products: true } } },
  });
  if (!category) {
    throw Object.assign(new Error("Category not found"), { statusCode: 404, code: "CATEGORY_NOT_FOUND" });
  }
  await prisma.category.delete({ where: { id } });
  return { id, preservedProducts: category._count.products };
}

export async function deleteCategoryWithProducts(id) {
  return prisma.$transaction(async (tx) => {
    const category = await tx.category.findUnique({
      where: { id },
      select: { _count: { select: { products: true } } },
    });
    if (!category) {
      throw Object.assign(new Error("Category not found"), { statusCode: 404, code: "CATEGORY_NOT_FOUND" });
    }
    const deletedProducts = await tx.product.deleteMany({ where: { categoryId: id } });
    await tx.category.delete({ where: { id } });
    return { id, deletedProducts: deletedProducts.count };
  });
}
