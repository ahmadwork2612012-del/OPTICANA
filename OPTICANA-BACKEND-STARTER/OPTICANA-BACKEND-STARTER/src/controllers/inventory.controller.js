import {
  changeStock,
  listInventoryMovements,
} from "../services/inventory.service.js";

import {
  inventoryAdjustmentSchema,
} from "../validators/inventory.validator.js";


/* =====================================
   LIST MOVEMENTS
===================================== */

export async function adminListInventoryMovements(
  req,
  res,
  next
) {
  try {
    const {
      productId,
    } = req.query;

    const movements =
      await listInventoryMovements({
        productId,
      });

    res.json({
      success: true,
      data: movements,
    });
  } catch (error) {
    next(error);
  }
}


/* =====================================
   MANUAL ADJUSTMENT
===================================== */

export async function adminAdjustInventory(
  req,
  res,
  next
) {
  try {
    const parsed =
      inventoryAdjustmentSchema.safeParse(
        req.body
      );


    if (
      !parsed.success
    ) {
      const error =
        new Error(
          "Invalid inventory adjustment data"
        );

      error.statusCode =
        400;

      error.code =
        "VALIDATION_ERROR";

      error.details =
        parsed.error.flatten();

      throw error;
    }


    const {
      quantity,
      reason,
    } = parsed.data;


    const result =
      await changeStock({
        productId:
          req.params.productId,

        quantity,

        type:
          "ADJUSTMENT",

        userId:
          req.user?.id ||
          null,

        note:
          reason ||
          "Manual inventory adjustment",
      });


    res.json({
      success: true,

      data: {
        product:
          result.product,

        movement:
          result.movement,
      },
    });
  } catch (error) {
    next(error);
  }
}