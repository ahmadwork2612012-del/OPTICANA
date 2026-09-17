import { z } from "zod";


const purchaseItemSchema =
  z.object({
    productId:
      z.string().min(1),

    quantity:
      z.number().int().positive(),

    purchasePrice:
      z.number().min(0),
  });


const paymentMethodSchema =
  z.enum([
    "CASH",
    "WHATSAPP",
    "CARD",
    "ONLINE",
    "OTHER",
  ]);


export const createPurchaseSchema =
  z.object({
    supplierId:
      z.string()
        .nullable()
        .optional(),

    invoiceNumber:
      z.string()
        .trim()
        .min(1)
        .optional(),

    discount:
      z.number()
        .min(0)
        .default(0),

    paidAmount:
      z.number()
        .min(0)
        .default(0),

    paymentMethod:
      paymentMethodSchema
        .default("CASH"),

    notes:
      z.string()
        .nullable()
        .optional(),

    source:
      z.string()
        .trim()
        .min(1)
        .default("admin"),

    items:
      z.array(
        purchaseItemSchema
      ).min(1),
  });


export const updatePurchaseSchema =
  z.object({
    supplierId:
      z.string()
        .nullable()
        .optional(),

    discount:
      z.number()
        .min(0)
        .optional(),

    notes:
      z.string()
        .nullable()
        .optional(),

    items:
      z.array(
        purchaseItemSchema
      )
        .min(1)
        .optional(),
  });


export const voidPurchaseSchema =
  z.object({
    reason:
      z.string()
        .max(500)
        .optional(),
  });