import { z } from "zod";


export const createSupplierSchema =
  z.object({
    name: z.string().min(1),

    phone:
      z.string()
        .nullable()
        .optional(),

    whatsapp:
      z.string()
        .nullable()
        .optional(),

    email:
      z.string()
        .email()
        .nullable()
        .optional(),

    address:
      z.string()
        .nullable()
        .optional(),

    notes:
      z.string()
        .nullable()
        .optional(),

    isActive:
      z.boolean()
        .default(true),
  });


export const updateSupplierSchema =
  createSupplierSchema.partial();