import prisma from "../lib/prisma.js";
import { writeAudit } from "./audit.service.js";

import { changeStock } from "./inventory.service.js";

import {
  getPaymentStatus,
  recordPayment,
  reversePayment,
  syncPurchasePaymentState,
} from "./payment.service.js";


/* =========================================================
   HELPERS
========================================================= */

function generatePurchaseNumber() {
  const now = new Date();

  const y = now.getFullYear();

  const m = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const d = String(
    now.getDate()
  ).padStart(2, "0");

  const timestamp =
    String(
      Date.now()
    ).slice(-6);

  const random =
    Math.floor(
      100000 +
      Math.random() * 900000
    );

  return `PUR-${y}${m}${d}-${timestamp}${random}`;
}


function isUniqueConstraintError(
  error
) {
  return (
    error?.code === "P2002"
  );
}


function normalizePaymentMethod(
  method
) {
  const value =
    String(
      method ||
        "CASH"
    )
      .trim()
      .toUpperCase();

  const aliases = {
    CASH:
      "CASH",

    CARD:
      "CARD",

    WHATSAPP:
      "WHATSAPP",

    ONLINE:
      "ONLINE",

    OTHER:
      "OTHER",
  };

  return (
    aliases[value] ||
    "CASH"
  );
}


/* =========================================================
   SERIALIZER
========================================================= */

function serializePurchase(
  purchase
) {
  if (!purchase) {
    return null;
  }

  return {
    id:
      purchase.id,

    invoiceNumber:
      purchase.invoiceNumber,

    status:
      purchase.status,

    subtotal:
      Number(
        purchase.subtotal
      ),

    discount:
      Number(
        purchase.discount
      ),

    total:
      Number(
        purchase.total
      ),

    paidAmount:
      Number(
        purchase.paidAmount
      ),

    remainingAmount:
      Number(
        purchase.remainingAmount
      ),

    paymentStatus:
      purchase.paymentStatus,

    stockApplied:
      purchase.stockApplied,

    source:
      purchase.source,

    notes:
      purchase.notes ||
      "",

    voidedAt:
      purchase.voidedAt,

    voidReason:
      purchase.voidReason ||
      null,

    supplier:
      purchase.supplier
        ? {
            id:
              purchase.supplier.id,

            name:
              purchase.supplier.name,

            phone:
              purchase.supplier.phone,
          }
        : null,

    supplierId:
      purchase.supplierId,

    items:
      Array.isArray(
        purchase.items
      )
        ? purchase.items.map(
            (item) => ({
              id:
                item.id,

              productId:
                item.productId,

              name:
                item.name,

              sku:
                item.sku,

              quantity:
                item.quantity,

              purchasePrice:
                Number(
                  item.purchasePrice
                ),

              price:
                Number(
                  item.purchasePrice
                ),

              total:
                Number(
                  item.total
                ),
            })
          )
        : [],

    createdAt:
      purchase.createdAt,

    updatedAt:
      purchase.updatedAt,
  };
}


const purchaseInclude = {
  supplier: {
    select: {
      id: true,

      name: true,

      phone: true,
    },
  },

  items: true,

  payments: {
    orderBy: {
      createdAt: "asc",
    },
  },
};


/* =========================================================
   LIST
========================================================= */

export async function listPurchases() {
  const purchases =
    await prisma.purchase.findMany({
      include:
        purchaseInclude,

      orderBy: {
        createdAt:
          "desc",
      },
    });

  return purchases.map(
    serializePurchase
  );
}


/* =========================================================
   GET
========================================================= */

export async function getPurchaseById(
  id
) {
  const purchase =
    await prisma.purchase.findUnique({
      where: {
        id,
      },

      include:
        purchaseInclude,
    });

  return serializePurchase(
    purchase
  );
}


/* =========================================================
   CREATE
========================================================= */

export async function createPurchase(
  data,
  userId
) {
  const result =
    await prisma.$transaction(
      async (tx) => {

        /* -----------------------------------------
           Supplier validation
        ----------------------------------------- */

        if (
          data.supplierId
        ) {
          const supplier =
            await tx.supplier.findUnique({
              where: {
                id:
                  data.supplierId,
              },

              select: {
                id: true,
              },
            });

          if (!supplier) {
            const error =
              new Error(
                "Supplier not found"
              );

            error.statusCode =
              404;

            error.code =
              "SUPPLIER_NOT_FOUND";

            throw error;
          }
        }


        /* -----------------------------------------
           Prepare items
        ----------------------------------------- */

        let subtotal =
          0;

        const preparedItems =
          [];


        for (
          const rawItem of
            data.items
        ) {
          const product =
            await tx.product.findUnique({
              where: {
                id:
                  rawItem.productId,
              },

              select: {
                id: true,

                name: true,

                sku: true,
              },
            });


          if (!product) {
            const error =
              new Error(
                `Product not found: ${rawItem.productId}`
              );

            error.statusCode =
              404;

            error.code =
              "PRODUCT_NOT_FOUND";

            throw error;
          }


          const quantity =
            Number(
              rawItem.quantity
            );

          const purchasePrice =
            Number(
              rawItem.purchasePrice
            );


          if (
            !Number.isInteger(
              quantity
            ) ||
            quantity <=
              0
          ) {
            const error =
              new Error(
                `Invalid quantity for product: ${product.name}`
              );

            error.statusCode =
              400;

            error.code =
              "INVALID_QUANTITY";

            throw error;
          }


          if (
            !Number.isFinite(
              purchasePrice
            ) ||
            purchasePrice <
              0
          ) {
            const error =
              new Error(
                `Invalid purchase price for product: ${product.name}`
              );

            error.statusCode =
              400;

            error.code =
              "INVALID_PURCHASE_PRICE";

            throw error;
          }


          const total =
            quantity *
            purchasePrice;

          subtotal +=
            total;


          preparedItems.push({
            productId:
              product.id,

            name:
              product.name,

            sku:
              product.sku,

            quantity,

            purchasePrice,

            total,
          });
        }


        /* -----------------------------------------
           Totals
        ----------------------------------------- */

        const discount =
          Number(
            data.discount ||
              0
          );


        if (
          !Number.isFinite(
            discount
          ) ||
          discount <
            0
        ) {
          const error =
            new Error(
              "Invalid discount"
            );

          error.statusCode =
            400;

          error.code =
            "INVALID_DISCOUNT";

          throw error;
        }


        if (
          discount >
          subtotal
        ) {
          const error =
            new Error(
              "Discount cannot exceed subtotal"
            );

          error.statusCode =
            400;

          error.code =
            "INVALID_DISCOUNT";

          throw error;
        }


        const total =
          subtotal -
          discount;


        const paidAmount =
          Number(
            data.paidAmount ||
              0
          );


        if (
          !Number.isFinite(
            paidAmount
          ) ||
          paidAmount <
            0
        ) {
          const error =
            new Error(
              "Invalid paid amount"
            );

          error.statusCode =
            400;

          error.code =
            "INVALID_PAID_AMOUNT";

          throw error;
        }


        if (
          paidAmount >
          total
        ) {
          const error =
            new Error(
              "Paid amount cannot exceed total"
            );

          error.statusCode =
            400;

          error.code =
            "INVALID_PAID_AMOUNT";

          throw error;
        }


        /* -----------------------------------------
           Invoice number
        ----------------------------------------- */

        const suppliedInvoiceNumber =
          String(
            data.invoiceNumber ||
              ""
          ).trim();


        const usesGeneratedInvoice =
          !suppliedInvoiceNumber;

        let invoiceNumber =
          suppliedInvoiceNumber ||
          generatePurchaseNumber();


        /* -----------------------------------------
           Payment method
        ----------------------------------------- */

        const paymentMethod =
          normalizePaymentMethod(
            data.paymentMethod
          );


        /* -----------------------------------------
           Create purchase
        ----------------------------------------- */

        let purchase = null;

        for (
          let attempt = 1;
          attempt <= 5;
          attempt++
        ) {
          try {
            purchase =
              await tx.purchase.create({
                data: {
                  invoiceNumber,

              supplierId:
                data.supplierId ||
                null,

              status:
                "RECEIVED",

              subtotal,

              discount,

              total,

              paidAmount:
                0,

              remainingAmount:
                total,

              paymentStatus:
                total > 0
                  ? "UNPAID"
                  : "PAID",

              stockApplied:
                true,

              source:
                data.source ||
                "admin",

              notes:
                data.notes ||
                null,

              items: {
                create:
                  preparedItems.map(
                    (item) => ({
                      productId:
                        item.productId,

                      name:
                        item.name,

                      sku:
                        item.sku,

                      quantity:
                        item.quantity,

                      purchasePrice:
                        item.purchasePrice,

                      total:
                        item.total,
                    })
                  ),
              },
            },

                include:
                  purchaseInclude,
              });

            break;
          } catch (error) {
            if (
              !isUniqueConstraintError(error) ||
              attempt === 5
            ) {
              if (
                isUniqueConstraintError(error)
              ) {
                if (
                  usesGeneratedInvoice
                ) {
                  const uniqueError =
                    new Error(
                      "Could not generate a unique purchase invoice number"
                    );

                  uniqueError.statusCode =
                    409;

                  uniqueError.code =
                    "PURCHASE_NUMBER_COLLISION";

                  throw uniqueError;
                }

                const duplicateError =
                  new Error(
                    "Invoice number already exists"
                  );

                duplicateError.statusCode =
                  409;

                duplicateError.code =
                  "DUPLICATE_INVOICE_NUMBER";

                throw duplicateError;
              }

              throw error;
            }

            invoiceNumber =
              generatePurchaseNumber();
          }
        }

        if (!purchase) {
          const error =
            new Error(
              "Could not create purchase"
            );

          error.statusCode =
            500;

          error.code =
            "PURCHASE_CREATE_FAILED";

          throw error;
        }


        /* -----------------------------------------
           Apply stock
        ----------------------------------------- */

        for (
          const item of
            preparedItems
        ) {
          await changeStock({
            tx,

            productId:
              item.productId,

            quantity:
              item.quantity,

            type:
              "PURCHASE",

            userId:
              userId ||
              null,

            note:
              `Purchase ${purchase.invoiceNumber}`,
          });


          await tx.product.update({
            where: {
              id:
                item.productId,
            },

            data: {
              purchasePrice:
                item.purchasePrice,
            },
          });
        }


        /* -----------------------------------------
           Record initial payment
        ----------------------------------------- */

        if (
          paidAmount >
          0
        ) {
          await recordPayment({
            tx,

            amount:
              paidAmount,

            type:
              "PURCHASE_PAYMENT",

            method:
              paymentMethod,

            source:
              "admin",

            supplierId:
              data.supplierId ||
              null,

            purchaseId:
              purchase.id,

            createdById:
              userId || null,

            note:
              `Initial payment for ${purchase.invoiceNumber}`,
          });
        }


        /* -----------------------------------------
           Synchronize payment state
        ----------------------------------------- */

        await syncPurchasePaymentState(
          tx,
          purchase.id
        );


        /* -----------------------------------------
           Return fresh purchase
        ----------------------------------------- */

        return tx.purchase.findUnique({
          where: {
            id:
              purchase.id,
          },

          include:
            purchaseInclude,
        });
      }
    );


  return serializePurchase(
    result
  );
}


/* =========================================================
   CREATE DRAFT PURCHASE
========================================================= */

export async function createDraftPurchase(
  data,
  userId
) {
  const result =
    await prisma.$transaction(
      async (tx) => {

        /* -----------------------------------------
           Supplier validation
        ----------------------------------------- */

        if (data.supplierId) {
          const supplier =
            await tx.supplier.findUnique({
              where: {
                id: data.supplierId,
              },

              select: {
                id: true,
              },
            });

          if (!supplier) {
            const error =
              new Error("Supplier not found");

            error.statusCode = 404;
            error.code = "SUPPLIER_NOT_FOUND";

            throw error;
          }
        }


        /* -----------------------------------------
           Prepare items from database
        ----------------------------------------- */

        let subtotal = 0;
        const preparedItems = [];

        for (const rawItem of data.items) {
          const product =
            await tx.product.findUnique({
              where: {
                id: rawItem.productId,
              },

              select: {
                id: true,
                name: true,
                sku: true,
              },
            });

          if (!product) {
            const error =
              new Error(
                `Product not found: ${rawItem.productId}`
              );

            error.statusCode = 404;
            error.code = "PRODUCT_NOT_FOUND";

            throw error;
          }

          const quantity =
            Number(rawItem.quantity);

          const purchasePrice =
            Number(rawItem.purchasePrice);

          if (
            !Number.isInteger(quantity) ||
            quantity <= 0
          ) {
            const error =
              new Error(
                `Invalid quantity for product: ${product.name}`
              );

            error.statusCode = 400;
            error.code = "INVALID_QUANTITY";

            throw error;
          }

          if (
            !Number.isFinite(purchasePrice) ||
            purchasePrice < 0
          ) {
            const error =
              new Error(
                `Invalid purchase price for product: ${product.name}`
              );

            error.statusCode = 400;
            error.code = "INVALID_PURCHASE_PRICE";

            throw error;
          }

          const total =
            quantity * purchasePrice;

          subtotal += total;

          preparedItems.push({
            productId: product.id,
            name: product.name,
            sku: product.sku,
            quantity,
            purchasePrice,
            total,
          });
        }


        /* -----------------------------------------
           Discount
        ----------------------------------------- */

        const discount =
          Number(data.discount || 0);

        if (
          !Number.isFinite(discount) ||
          discount < 0
        ) {
          const error =
            new Error("Invalid discount");

          error.statusCode = 400;
          error.code = "INVALID_DISCOUNT";

          throw error;
        }

        if (discount > subtotal) {
          const error =
            new Error(
              "Discount cannot exceed subtotal"
            );

          error.statusCode = 400;
          error.code = "INVALID_DISCOUNT";

          throw error;
        }

        const total =
          subtotal - discount;


        /* -----------------------------------------
           Draft must never contain a payment
        ----------------------------------------- */

        if (
          Number(data.paidAmount || 0) !== 0
        ) {
          const error =
            new Error(
              "A draft purchase cannot contain a payment"
            );

          error.statusCode = 409;
          error.code = "DRAFT_PAYMENT_NOT_ALLOWED";

          throw error;
        }


        /* -----------------------------------------
           Invoice number
        ----------------------------------------- */

        const suppliedInvoiceNumber =
          String(
            data.invoiceNumber || ""
          ).trim();

        const usesGeneratedInvoice =
          !suppliedInvoiceNumber;

        let invoiceNumber =
          suppliedInvoiceNumber ||
          generatePurchaseNumber();


        /* -----------------------------------------
           Create draft
        ----------------------------------------- */

        let purchase = null;

        for (
          let attempt = 1;
          attempt <= 5;
          attempt++
        ) {
          try {
            purchase =
              await tx.purchase.create({
                data: {
                  invoiceNumber,

                  supplierId:
                    data.supplierId ||
                    null,

                  status:
                    "DRAFT",

                  subtotal,

                  discount,

                  total,

                  paidAmount:
                    0,

                  remainingAmount:
                    total,

                  paymentStatus:
                    total > 0
                      ? "UNPAID"
                      : "PAID",

                  stockApplied:
                    false,

                  source:
                    data.source ||
                    "admin",

                  notes:
                    data.notes ||
                    null,

                  items: {
                    create:
                      preparedItems.map(
                        (item) => ({
                          productId:
                            item.productId,

                          name:
                            item.name,

                          sku:
                            item.sku,

                          quantity:
                            item.quantity,

                          purchasePrice:
                            item.purchasePrice,

                          total:
                            item.total,
                        })
                      ),
                  },
                },

                include:
                  purchaseInclude,
              });

            break;

          } catch (error) {
            if (
              !isUniqueConstraintError(error) ||
              attempt === 5
            ) {
              if (
                isUniqueConstraintError(error)
              ) {
                if (
                  usesGeneratedInvoice
                ) {
                  const uniqueError =
                    new Error(
                      "Could not generate a unique purchase invoice number"
                    );

                  uniqueError.statusCode = 409;
                  uniqueError.code =
                    "PURCHASE_NUMBER_COLLISION";

                  throw uniqueError;
                }

                const duplicateError =
                  new Error(
                    "Invoice number already exists"
                  );

                duplicateError.statusCode = 409;
                duplicateError.code =
                  "DUPLICATE_INVOICE_NUMBER";

                throw duplicateError;
              }

              throw error;
            }

            invoiceNumber =
              generatePurchaseNumber();
          }
        }


        if (!purchase) {
          const error =
            new Error(
              "Could not create draft purchase"
            );

          error.statusCode = 500;
          error.code = "DRAFT_PURCHASE_CREATE_FAILED";

          throw error;
        }


        /*
          IMPORTANT:
          No inventory mutation.
          No product purchase-price update.
          No payment creation.
        */

        return purchase;
      }
    );

  return serializePurchase(result);
}


/* =========================================================
   RECEIVE PURCHASE
========================================================= */

export async function receivePurchase(
  id,
  paymentData = {},
  userId = null
) {
  const result =
    await prisma.$transaction(
      async (tx) => {

        const purchase =
          await tx.purchase.findUnique({
            where: {
              id,
            },

            include: {
              items: true,
              payments: true,
            },
          });

        if (!purchase) {
          const error =
            new Error("Purchase not found");

          error.statusCode = 404;
          error.code = "NOT_FOUND";

          throw error;
        }

        if (purchase.status === "VOID") {
          const error =
            new Error(
              "Cannot receive a void purchase"
            );

          error.statusCode = 409;
          error.code = "PURCHASE_VOID";

          throw error;
        }

        if (purchase.status === "RECEIVED") {
          const error =
            new Error(
              "Purchase is already received"
            );

          error.statusCode = 409;
          error.code = "PURCHASE_ALREADY_RECEIVED";

          throw error;
        }


        /* -----------------------------------------
           Only DRAFT can be received
        ----------------------------------------- */

        if (purchase.status !== "DRAFT") {
          const error =
            new Error(
              `Cannot receive purchase with status ${purchase.status}`
            );

          error.statusCode = 409;
          error.code = "INVALID_PURCHASE_STATUS";

          throw error;
        }


        /* -----------------------------------------
           Optional initial payment
        ----------------------------------------- */

        const paidAmount =
          Number(
            paymentData.paidAmount || 0
          );

        if (
          !Number.isFinite(paidAmount) ||
          paidAmount < 0
        ) {
          const error =
            new Error("Invalid paid amount");

          error.statusCode = 400;
          error.code = "INVALID_PAID_AMOUNT";

          throw error;
        }

        if (paidAmount > Number(purchase.total)) {
          const error =
            new Error(
              "Paid amount cannot exceed total"
            );

          error.statusCode = 400;
          error.code = "INVALID_PAID_AMOUNT";

          throw error;
        }


        const paymentMethod =
          normalizePaymentMethod(
            paymentData.paymentMethod
          );


        /* -----------------------------------------
           Mark received first inside transaction
        ----------------------------------------- */

        const received =
          await tx.purchase.update({
            where: {
              id,
            },

            data: {
              status: "RECEIVED",
              stockApplied: true,
              paidAmount: 0,
              remainingAmount: purchase.total,
              paymentStatus:
                Number(purchase.total) > 0
                  ? "UNPAID"
                  : "PAID",
            },
          });


        /* -----------------------------------------
           Apply inventory exactly once
        ----------------------------------------- */

        for (const item of purchase.items) {
          if (!item.productId) {
            continue;
          }

          await changeStock({
            tx,

            productId:
              item.productId,

            quantity:
              item.quantity,

            type:
              "PURCHASE",

            userId:
              userId || null,

            note:
              `Purchase ${purchase.invoiceNumber}`,
          });

          await tx.product.update({
            where: {
              id:
                item.productId,
            },

            data: {
              purchasePrice:
                item.purchasePrice,
            },
          });
        }


        /* -----------------------------------------
           Record initial payment if provided
        ----------------------------------------- */

        if (paidAmount > 0) {
          await recordPayment({
            tx,

            amount:
              paidAmount,

            type:
              "PURCHASE_PAYMENT",

            method:
              paymentMethod,

            source:
              "admin",

            supplierId:
              purchase.supplierId ||
              null,

            purchaseId:
              purchase.id,

            createdById:
              userId || null,

            note:
              `Initial payment for ${purchase.invoiceNumber}`,
          });
        }


        /* -----------------------------------------
           Sync financial snapshot
        ----------------------------------------- */

        await syncPurchasePaymentState(
          tx,
          purchase.id
        );

        await writeAudit({
          tx,
          userId,
          action: "RECEIVE",
          entityType: "PURCHASE",
          entityId: purchase.id,
          before: purchase,
          after: received,
        });

        return tx.purchase.findUnique({
          where: {
            id,
          },

          include:
            purchaseInclude,
        });
      }
    );

  return serializePurchase(result);
}


/* =========================================================
   UPDATE
========================================================= */

export async function updatePurchase(
  id,
  data
) {
  const purchase =
    await prisma.purchase.findUnique({
      where: {
        id,
      },

      include: {
        items: true,
      },
    });


  if (!purchase) {
    const error =
      new Error(
        "Purchase not found"
      );

    error.statusCode = 404;
    error.code = "NOT_FOUND";

    throw error;
  }


  /* -----------------------------------------
     Lifecycle guards
  ----------------------------------------- */

  if (
    purchase.status ===
    "VOID"
  ) {
    const error =
      new Error(
        "Cannot update a void purchase"
      );

    error.statusCode = 409;
    error.code = "PURCHASE_VOID";

    throw error;
  }


  /*
    Items are editable only while the
    purchase is still a DRAFT.
  */

  if (
    data.items !== undefined &&
    purchase.status !== "DRAFT"
  ) {
    const error =
      new Error(
        "Cannot change purchase items after the purchase has been received"
      );

    error.statusCode = 409;
    error.code = "STOCK_ALREADY_APPLIED";

    throw error;
  }


  /* -----------------------------------------
     Validate supplier change
  ----------------------------------------- */

  const supplierId =
    data.supplierId !== undefined
      ? data.supplierId || null
      : purchase.supplierId || null;


  if (
    data.supplierId !== undefined &&
    supplierId
  ) {
    const supplier =
      await prisma.supplier.findUnique({
        where: {
          id: supplierId,
        },

        select: {
          id: true,
        },
      });

    if (!supplier) {
      const error =
        new Error(
          "Supplier not found"
        );

      error.statusCode = 404;
      error.code = "SUPPLIER_NOT_FOUND";

      throw error;
    }
  }


  /* -----------------------------------------
     Read current ledger balance
  ----------------------------------------- */

  const {
    paidAmount:
      currentPaidAmount,
  } =
    await prisma.payment.aggregate({
      where: {
        purchaseId:
          purchase.id,
      },

      _sum: {
        amount: true,
      },
    });


  const actualPaidAmount =
    Math.max(
      Number(
        currentPaidAmount || 0
      ),
      0
    );


  /*
    A received purchase with existing payments
    cannot silently change supplier identity.
  */

  if (
    purchase.status ===
      "RECEIVED" &&
    data.supplierId !== undefined &&
    supplierId !==
      (purchase.supplierId || null) &&
    actualPaidAmount > 0
  ) {
    const error =
      new Error(
        "Cannot change supplier after payments have been recorded"
      );

    error.statusCode = 409;
    error.code =
      "SUPPLIER_CHANGE_AFTER_PAYMENT";

    throw error;
  }


  /* -----------------------------------------
     Prepare replacement items for DRAFT
  ----------------------------------------- */

  let preparedItems =
    purchase.items;

  let newSubtotal =
    Number(
      purchase.subtotal
    );


  if (
    data.items !== undefined
  ) {
    preparedItems = [];

    newSubtotal = 0;


    for (
      const rawItem of
        data.items
    ) {
      const product =
        await prisma.product.findUnique({
          where: {
            id:
              rawItem.productId,
          },

          select: {
            id: true,
            name: true,
            sku: true,
          },
        });


      if (!product) {
        const error =
          new Error(
            `Product not found: ${rawItem.productId}`
          );

        error.statusCode = 404;
        error.code = "PRODUCT_NOT_FOUND";

        throw error;
      }


      const quantity =
        Number(
          rawItem.quantity
        );

      const purchasePrice =
        Number(
          rawItem.purchasePrice
        );


      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity <= 0
      ) {
        const error =
          new Error(
            `Invalid quantity for product: ${product.name}`
          );

        error.statusCode = 400;
        error.code = "INVALID_QUANTITY";

        throw error;
      }


      if (
        !Number.isFinite(
          purchasePrice
        ) ||
        purchasePrice < 0
      ) {
        const error =
          new Error(
            `Invalid purchase price for product: ${product.name}`
          );

        error.statusCode = 400;
        error.code = "INVALID_PURCHASE_PRICE";

        throw error;
      }


      const itemTotal =
        quantity *
        purchasePrice;


      newSubtotal +=
        itemTotal;


      preparedItems.push({
        productId:
          product.id,

        name:
          product.name,

        sku:
          product.sku,

        quantity,

        purchasePrice,

        total:
          itemTotal,
      });
    }
  }


  /* -----------------------------------------
     Discount
  ----------------------------------------- */

  const newDiscount =
    data.discount !== undefined
      ? Number(
          data.discount
        )
      : Number(
          purchase.discount
        );


  if (
    !Number.isFinite(
      newDiscount
    ) ||
    newDiscount < 0
  ) {
    const error =
      new Error(
        "Invalid discount"
      );

    error.statusCode = 400;
    error.code = "INVALID_DISCOUNT";

    throw error;
  }


  if (
    newDiscount >
    newSubtotal
  ) {
    const error =
      new Error(
        "Discount cannot exceed subtotal"
      );

    error.statusCode = 400;
    error.code = "INVALID_DISCOUNT";

    throw error;
  }


  const newTotal =
    newSubtotal -
    newDiscount;


  /*
    Never allow a financial edit to make the
    purchase total lower than already-paid money.
  */

  if (
    actualPaidAmount >
    newTotal
  ) {
    const error =
      new Error(
        "New total cannot be lower than the amount already paid"
      );

    error.statusCode = 409;
    error.code =
      "TOTAL_BELOW_PAID_AMOUNT";

    throw error;
  }


  /* -----------------------------------------
     TRANSACTION
  ----------------------------------------- */

  const updated =
    await prisma.$transaction(
      async (tx) => {

        /*
          Replace items only for DRAFT.
          No inventory operation occurs here.
        */

        if (
          data.items !== undefined
        ) {
          await tx.purchaseItem.deleteMany({
            where: {
              purchaseId:
                purchase.id,
            },
          });


          if (
            preparedItems.length > 0
          ) {
            await tx.purchaseItem.createMany({
              data:
                preparedItems.map(
                  (item) => ({
                    purchaseId:
                      purchase.id,

                    productId:
                      item.productId,

                    name:
                      item.name,

                    sku:
                      item.sku,

                    quantity:
                      item.quantity,

                    purchasePrice:
                      item.purchasePrice,

                    total:
                      item.total,
                  })
                ),
            });
          }
        }


        const result =
          await tx.purchase.update({
            where: {
              id,
            },

            data: {
              ...(data.supplierId !==
              undefined
                ? {
                    supplierId:
                      supplierId,
                  }
                : {}),

              subtotal:
                newSubtotal,

              discount:
                newDiscount,

              total:
                newTotal,

              ...(data.notes !==
              undefined
                ? {
                    notes:
                      data.notes ||
                      null,
                  }
                : {}),
            },
          });


        await syncPurchasePaymentState(
          tx,
          result.id
        );


        return tx.purchase.findUnique({
          where: {
            id:
              result.id,
          },

          include:
            purchaseInclude,
        });
      }
    );


  return serializePurchase(
    updated
  );
}


/* =========================================================
   VOID
========================================================= */

export async function voidPurchase(
  id,
  reason,
  userId
) {
  const result =
    await prisma.$transaction(
      async (tx) => {

        const purchase =
          await tx.purchase.findUnique({
            where: {
              id,
            },

            include: {
              items:
                true,

              payments:
                true,
            },
          });


        if (!purchase) {
          const error =
            new Error(
              "Purchase not found"
            );

          error.statusCode =
            404;

          error.code =
            "NOT_FOUND";

          throw error;
        }


        if (
          purchase.status ===
          "VOID"
        ) {
          const error =
            new Error(
              "Purchase already void"
            );

          error.statusCode =
            409;

          error.code =
            "ALREADY_VOID";

          throw error;
        }


        /* -----------------------------------------
           Reverse stock
        ----------------------------------------- */

        if (
          purchase.stockApplied
        ) {
          for (
            const item of
              purchase.items
          ) {
            if (
              !item.productId
            ) {
              continue;
            }


            await changeStock({
              tx,

              productId:
                item.productId,

              quantity:
                -item.quantity,

              type:
                "RETURN_OUT",

              userId:
                userId ||
                null,

              note:
                `Void purchase ${purchase.invoiceNumber}`,
            });
          }
        }


        /* -----------------------------------------
           Mark void
        ----------------------------------------- */

        await tx.purchase.update({
          where: {
            id,
          },

          data: {
            status:
              "VOID",

            stockApplied:
              false,

            voidedAt:
              new Date(),

            voidReason:
              reason ||
              null,
          },
        });


        /* -----------------------------------------
           Reverse payments
        ----------------------------------------- */

        const positivePayments =
          purchase.payments.filter(
            (payment) =>
              Number(payment.amount) > 0
          );

        for (
          const payment of
            positivePayments
        ) {
          await reversePayment({
            tx,

            originalPaymentId:
              payment.id,

            createdById:
              userId || null,

            source:
              "admin",

            note:
              `Void purchase payment ${purchase.invoiceNumber}`,
          });
        }


        /* -----------------------------------------
           Sync payment state
        ----------------------------------------- */

        await syncPurchasePaymentState(
          tx,
          purchase.id
        );

        await writeAudit({
          tx,
          userId,
          action: "VOID",
          entityType: "PURCHASE",
          entityId: purchase.id,
          before: purchase,
          after: { status: "VOID", stockApplied: false, voidReason: reason || null },
        });

        return tx.purchase.findUnique({
          where: {
            id,
          },

          include:
            purchaseInclude,
        });
      }
    );


  return serializePurchase(
    result
  );
}


/* =========================================================
   DELETE
========================================================= */

export async function deletePurchase(
  id
) {
  const purchase =
    await prisma.purchase.findUnique({
      where: {
        id,
      },
    });


  if (!purchase) {
    const error =
      new Error(
        "Purchase not found"
      );

    error.statusCode =
      404;

    error.code =
      "NOT_FOUND";

    throw error;
  }


  if (
    purchase.stockApplied ||
    purchase.status ===
      "RECEIVED"
  ) {
    const error =
      new Error(
        "Cannot delete a received purchase. Void it instead."
      );

    error.statusCode =
      409;

    error.code =
      "PURCHASE_MUST_BE_VOIDED";

    throw error;
  }


  await prisma.purchase.delete({
    where: {
      id,
    },
  });


  return {
    id,
  };
}