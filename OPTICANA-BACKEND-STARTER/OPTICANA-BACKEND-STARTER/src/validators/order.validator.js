import { z } from "zod";

export const createOrderSchema = z.object({
  customerId: z.string().nullable().optional(),
  customer: z.object({
    name: z.string().min(1),
    phone: z.string().min(3),
    whatsapp: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
  }).nullable().optional(),
  paymentMethod: z
    .enum(["CASH", "WHATSAPP", "CARD", "ONLINE", "OTHER"])
    .default("WHATSAPP"),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
  source: z.string().default("admin"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "COMPLETED",
    "CANCELLED",
  ]),
});
