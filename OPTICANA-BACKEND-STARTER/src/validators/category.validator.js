import { z } from "zod";

const categoryImageSchema = z.string().trim().refine((value) => {
  if (!value) return false;
  if (value.startsWith("data:image/")) return true;
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}, "Invalid category image URL");

export const createCategorySchema = z.object({
  name: z.string().min(1),
  nameEn: z.string().trim().optional(),
  slug: z.string().min(1),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  imageUrl: categoryImageSchema.nullable().optional(),
  isActive: z.boolean().default(true),
  showOnStore: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();
