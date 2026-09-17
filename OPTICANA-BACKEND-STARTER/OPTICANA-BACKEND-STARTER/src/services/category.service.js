import prisma from "../lib/prisma.js";
import { persistDataUrl } from "./media.service.js";


function serializeCategory(category) {
  if (!category) {
    return null;
  }

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || "",
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

export async function deleteCategory(id) {
  await prisma.category.delete({ where: { id } });
  return { id };
}

