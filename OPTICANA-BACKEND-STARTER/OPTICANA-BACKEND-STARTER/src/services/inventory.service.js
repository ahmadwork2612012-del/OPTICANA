import prisma from "../lib/prisma.js";

/*
  Inventory is the single source of truth for stock changes.

  Rules:
  - Product.stock = current stock
  - InventoryMovement = history/audit trail
  - Every stock change must go through changeStock()
  - The caller can pass a Prisma transaction client (tx)
*/

const ALLOWED_MOVEMENT_TYPES = new Set([
  "PURCHASE",
  "SALE",
  "RETURN_IN",
  "RETURN_OUT",
  "ADJUSTMENT",
  "DAMAGE",
  "INITIAL",
]);


/* =========================================================
   SERIALIZER
========================================================= */

function serializeMovement(movement) {
  if (!movement) {
    return null;
  }

  return {
    id: movement.id,

    productId: movement.productId,

    productName:
      movement.product?.name || null,

    productSku:
      movement.product?.sku || null,

    userId:
      movement.userId || null,

    type:
      movement.type,

    quantity:
      movement.quantity,

    stockAfter:
      movement.stockAfter,

    note:
      movement.note || null,

    createdAt:
      movement.createdAt,
  };
}


/* =========================================================
   CHANGE STOCK
========================================================= */

/**
 * Change product stock and create the corresponding
 * inventory movement atomically.
 *
 * IMPORTANT:
 * Use tx when called from a larger Prisma transaction.
 */
export async function changeStock({
  tx = prisma,
  productId,
  quantity,
  type,
  userId = null,
  note = null,
}) {
  if (!productId) {
    const error = new Error("Product ID is required");
    error.statusCode = 400;
    error.code = "PRODUCT_ID_REQUIRED";
    throw error;
  }

  if (!Number.isInteger(quantity) || quantity === 0) {
    const error = new Error(
      "Stock change quantity must be a non-zero integer"
    );

    error.statusCode = 400;
    error.code = "INVALID_STOCK_QUANTITY";

    throw error;
  }

  if (!ALLOWED_MOVEMENT_TYPES.has(type)) {
    const error = new Error(
      `Invalid inventory movement type: ${type}`
    );

    error.statusCode = 400;
    error.code = "INVALID_INVENTORY_MOVEMENT_TYPE";

    throw error;
  }

  /*
    Product must exist.
  */
  const existingProduct =
    await tx.product.findUnique({
      where: {
        id: productId,
      },

      select: {
        id: true,
        name: true,
        stock: true,
        reorderLevel: true,
      },
    });

  if (!existingProduct) {
    const error = new Error(
      `Product not found: ${productId}`
    );

    error.statusCode = 404;
    error.code = "PRODUCT_NOT_FOUND";

    throw error;
  }


  /*
    Negative quantity = stock removal.

    updateMany() with stock >= amount gives us
    an atomic protection against negative stock.
  */
  if (quantity < 0) {
    const amountToRemove =
      Math.abs(quantity);

    const updated =
      await tx.product.updateMany({
        where: {
          id: productId,
          stock: {
            gte: amountToRemove,
          },
        },

        data: {
          stock: {
            decrement: amountToRemove,
          },
        },
      });

    if (updated.count !== 1) {
      const error = new Error(
        `Insufficient stock for product: ${existingProduct.name}`
      );

      error.statusCode = 409;
      error.code = "INSUFFICIENT_STOCK";

      throw error;
    }
  } else {
    /*
      Positive quantity = stock addition.
    */
    await tx.product.update({
      where: {
        id: productId,
      },

      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  }


  /*
    Read the resulting stock after the update.
  */
  const updatedProduct =
    await tx.product.findUnique({
      where: {
        id: productId,
      },

      select: {
        id: true,
        name: true,
        stock: true,
        reorderLevel: true,
      },
    });


  if (!updatedProduct) {
    const error = new Error(
      `Product disappeared during stock update: ${productId}`
    );

    error.statusCode = 500;
    error.code = "STOCK_UPDATE_FAILED";

    throw error;
  }


  /*
    Write the audit trail.
  */
  const movement =
    await tx.inventoryMovement.create({
      data: {
        productId,
        userId: userId || null,
        type,
        quantity,
        stockAfter: updatedProduct.stock,
        note: note || null,
      },

      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
      },
    });


  if (
    existingProduct.stock > existingProduct.reorderLevel &&
    updatedProduct.stock <= updatedProduct.reorderLevel
  ) {
    await tx.notification.create({
      data: {
        title: updatedProduct.stock <= 0 ? "نفد المخزون" : "مخزون منخفض",
        message: `${updatedProduct.name} أصبح مخزونه ${updatedProduct.stock}`,
        type: "stock",
        entityType: "product",
        entityId: updatedProduct.id,
        priority: updatedProduct.stock <= 0 ? "high" : "normal",
        source: "system",
      },
    });
  }

  return {
    product: {
      id: updatedProduct.id,
      name: updatedProduct.name,
      stock: updatedProduct.stock,
    },

    movement:
      serializeMovement(movement),
  };
}


/* =========================================================
   LIST MOVEMENTS
========================================================= */

export async function listInventoryMovements({
  productId,
} = {}) {
  const movements =
    await prisma.inventoryMovement.findMany({
      where: productId
        ? {
            productId,
          }
        : undefined,

      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 200,
    });

  return movements.map(
    serializeMovement
  );
}