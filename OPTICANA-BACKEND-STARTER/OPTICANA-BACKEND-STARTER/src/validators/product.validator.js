import { z } from "zod";

export const createProductSchema = z.object({
  sku: z.string().trim().min(1),
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),

  description:
    z.string().optional(),

  price:
    z.number().positive(),

  oldPrice:
    z.number().positive().nullable().optional(),

  purchasePrice:
    z.number().positive().nullable().optional(),

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
          z.string().url(),

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

    slug:
      z.string().trim().min(1).optional(),

    description:
      z.string().optional(),

    price:
      z.number().positive().optional(),

    oldPrice:
      z.number().positive().nullable().optional(),

    purchasePrice:
      z.number().positive().nullable().optional(),

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
            z.string().url(),

          altText:
            z.string().optional(),

          isPrimary:
            z.boolean().optional(),

          sortOrder:
            z.number().int().optional(),
        })
      ).optional(),
  });