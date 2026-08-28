import { z } from "zod";


/* =====================================
   MANUAL ADJUSTMENT
===================================== */

export const inventoryAdjustmentSchema =
  z.object({
    quantity:
      z.number()
        .int()
        .refine(
          (value) =>
            value !== 0,
          {
            message:
              "Quantity cannot be zero",
          }
        ),

    reason:
      z.string()
        .trim()
        .max(500)
        .optional()
        .default(""),
  });