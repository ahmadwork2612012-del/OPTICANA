import { z } from "zod";

export const createOrderSchema = z.object({
  customerId: z.string().nullable().optional(),
  customer: z.object({
    name: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(3).max(30),
    whatsapp: z.string().trim().max(30).optional(),
    email: z.string().email().max(254).optional(),
    address: z.string().max(500).optional(),
  }).nullable().optional(),
  paymentMethod: z
    .enum(["CASH", "WHATSAPP", "CARD", "ONLINE", "OTHER"])
    .default("WHATSAPP"),
  discount: z.number().min(0).default(0),
  notes: z.string().max(1000).optional(),
  source: z.string().default("admin"),
  dueDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid due date").nullable().optional(),
  initialPaymentAmount: z.number().min(0).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(100),
      })
    )
    .min(1)
    .max(50),
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
