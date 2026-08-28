import { z } from "zod";

export const submitReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const updateReviewStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  featured: z.boolean().optional(),
});
