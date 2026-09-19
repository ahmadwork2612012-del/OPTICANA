import { z } from "zod";


const mediaUrlSchema = z.string().trim().refine((value) => {
  if (!value) return false;
  if (value.startsWith("data:image/")) return true;
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}, "Invalid media URL");

export const createProductSchema = z.object({
  sku: z.string().trim().min(1),
  name: z.string().trim().min(1),
  nameEn: z.string().trim().optional(),
  slug: z.string().trim().min(1),

  description:
    z.string().optional(),
  descriptionEn:
    z.string().optional(),

  price:
    z.number().positive(),

  oldPrice:
    z.number().min(0).nullable().optional(),

  purchasePrice:
    z.number().min(0).nullable().optional(),

  initialStock:
    z.number().int().min(0).default(0),

  reorderLevel:
    z.number().int().min(0).default(0),

  color:
    z.string().optional(),

  material:
    z.string().optional(),

  size:
    z.string().optional(),

  status:
    z.enum([
      "DRAFT",
      "PUBLISHED",
      "ARCHIVED",
    ]).default("DRAFT"),

  showOnStore:
    z.boolean().default(true),

  featured:
    z.boolean().default(false),

  isNew:
    z.boolean().default(false),

  isSale:
    z.boolean().default(false),

  categoryId:
    z.string().nullable().optional(),

  images:
    z.array(
      z.object({
        url:
          mediaUrlSchema,

        altText:
          z.string().optional(),

        isPrimary:
          z.boolean().optional(),

        sortOrder:
          z.number().int().optional(),
      })
    ).optional(),
});

export const updateProductSchema =
  z.object({
    sku:
      z.string().trim().min(1).optional(),

    name:
      z.string().trim().min(1).optional(),

    nameEn:
      z.string().trim().optional(),

    slug:
      z.string().trim().min(1).optional(),

    description:
      z.string().optional(),

    descriptionEn:
      z.string().optional(),

    price:
      z.number().positive().optional(),

    oldPrice:
      z.number().min(0).nullable().optional(),

    purchasePrice:
      z.number().min(0).nullable().optional(),

    reorderLevel:
      z.number().int().min(0).optional(),

    color:
      z.string().optional(),

    material:
      z.string().optional(),

    size:
      z.string().optional(),

    status:
      z.enum([
        "DRAFT",
        "PUBLISHED",
        "ARCHIVED",
      ]).optional(),

    showOnStore:
      z.boolean().optional(),

    featured:
      z.boolean().optional(),

    isNew:
      z.boolean().optional(),

    isSale:
      z.boolean().optional(),

    categoryId:
      z.string().nullable().optional(),

    images:
      z.array(
        z.object({
          url:
            mediaUrlSchema,

          altText:
            z.string().optional(),

          isPrimary:
            z.boolean().optional(),

          sortOrder:
            z.number().int().optional(),
        })
      ).optional(),
  });
