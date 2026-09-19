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
  dueDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid due date").nullable().optional(),
  initialPaymentAmount: z.number().min(0).optional(),
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
