import { z } from "zod";


export const createPaymentSchema =
  z.object({
    amount:
      z.number().positive(),

    type:
      z.enum([
        "SALE_PAYMENT",
        "PURCHASE_PAYMENT",
        "EXPENSE_PAYMENT",
        "REPAIR_PAYMENT",
        "OTHER",
      ]),

    method:
      z.enum([
        "CASH",
        "WHATSAPP",
        "CARD",
        "ONLINE",
        "OTHER",
      ]).default("CASH"),

    source:
      z.string().trim().min(1).default("admin"),

    customerId:
      z.string().nullable().optional(),

    supplierId:
      z.string().nullable().optional(),

    orderId:
      z.string().nullable().optional(),

    purchaseId:
      z.string().nullable().optional(),

    expenseId:
      z.string().nullable().optional(),

    repairId:
      z.string().nullable().optional(),

    note:
      z.string().nullable().optional(),
  });