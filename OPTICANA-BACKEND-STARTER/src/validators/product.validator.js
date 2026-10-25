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

const customFieldSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: z.enum(["text", "number", "image"]).optional().default("text"),
  value: z.union([
    z.string().trim().min(1).max(500),
    z.number().finite(),
  ]),
}).superRefine((field, context) => {
  if (field.type === "number" && typeof field.value !== "number") {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["value"], message: "Number fields must use a numeric value" });
  }
  if ((field.type === "text" || field.type === "image") && typeof field.value !== "string") {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["value"], message: "Text and image fields must use a string value" });
  }
  if (field.type === "image" && typeof field.value === "string" && !mediaUrlSchema.safeParse(field.value).success) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["value"], message: "Image fields must contain a valid image URL" });
  }
});

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

  customFields:
    z.array(customFieldSchema).max(50).default([]),

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

    customFields:
      z.array(customFieldSchema).max(50).optional(),

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
