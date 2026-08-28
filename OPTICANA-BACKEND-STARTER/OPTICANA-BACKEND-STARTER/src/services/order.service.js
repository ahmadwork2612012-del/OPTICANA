import prisma from "../lib/prisma.js";
import { changeStock } from "./inventory.service.js";
import {
  recordPayment,
  reversePayment,
  syncOrderPaymentState,
} from "./payment.service.js";


/* =========================================================
   SERIALIZER
========================================================= */

function serializeOrder(order) {
  if (!order) {
    return null;
  }

  return {
    id:
      order.id,

    orderNumber:
      order.orderNumber,

    status:
      order.status,

    paymentMethod:
      order.paymentMethod,

    subtotal:
      Number(order.subtotal),

    discount:
      Number(order.discount),

    total:
      Number(order.total),

    currency:
      order.currency,

    notes:
      order.notes || null,

    source:
      order.source,

    stockApplied:
      order.stockApplied === true,

    paidAmount:
      Number(
        order.paidAmount || 0
      ),

    remainingAmount:
      Number(
        order.remainingAmount || 0
      ),

    paymentStatus:
      order.paymentStatus,

    customer:
      order.customer
        ? {
            id:
              order.customer.id,

            name:
              order.customer.name,

            phone:
              order.customer.phone,
          }
        : null,

    items:
      Array.isArray(
        order.items
      )
        ? order.items.map(
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

              unitPrice:
                Number(
                  item.unitPrice
                ),

              costPrice:
                Number(
                  item.costPrice || 0
                ),

              total:
                Number(
                  item.total
                ),
            })
          )
        : [],

    createdAt:
      order.createdAt,

    updatedAt:
      order.updatedAt,
  };
}


/* =========================================================
   ORDER NUMBER
========================================================= */

function generateOrderNumber() {
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

  const rand =
    Math.floor(
      100000 +
      Math.random() * 900000
    );

  return `OPT-${y}${m}${d}-${timestamp}${rand}`;
}


function isUniqueConstraintError(
  error
) {
  return (
    error?.code === "P2002"
  );
}


/* =========================================================
   INCLUDE
========================================================= */

const orderInclude = {
  customer: {
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

export async function listOrders() {
  const orders =
    await prisma.order.findMany({
      include:
        orderInclude,

      orderBy: {
        createdAt:
          "desc",
      },
    });

  return orders.map(
    serializeOrder
  );
}


/* =========================================================
   GET
========================================================= */

export async function getOrderById(
  id
) {
  const order =
    await prisma.order.findUnique({
      where: {
        id,
      },

      include:
        orderInclude,
    });

  return serializeOrder(
    order
  );
}


/* =========================================================
   CREATE
========================================================= */

export async function createOrder(
  {
    customerId,
    customer = null,
    items,
    paymentMethod,
    discount,
    notes,
    source,
  },
  userId
) {
  if (
    !Array.isArray(
      items
    ) ||
    items.length === 0
  ) {
    const error =
      new Error(
        "Order must contain at least one item"
      );

    error.statusCode =
      400;

    error.code =
      "EMPTY_ORDER";

    throw error;
  }


  const order =
    await prisma.$transaction(
      async (tx) => {
        let subtotal = 0;
        let resolvedCustomerId = customerId || null;

        const preparedItems = [];


        /* -----------------------------------------
           Validate customer
        ----------------------------------------- */

        if (customerId) {
          const customer =
            await tx.customer.findUnique({
              where: {
                id:
                  customerId,
              },

              select: {
                id: true,
              },
            });

          if (!customer) {
            const error =
              new Error(
                "Customer not found"
              );

            error.statusCode =
              404;

            error.code =
              "CUSTOMER_NOT_FOUND";

            throw error;
          }
        }


        if (!resolvedCustomerId && customer && typeof customer === "object") {
          const name = String(customer.name || "").trim();
          const phone = String(customer.phone || "").trim();

          if (!name || !phone) {
            const error = new Error("Customer name and phone are required");
            error.statusCode = 400;
            error.code = "CUSTOMER_INFO_REQUIRED";
            throw error;
          }

          const existing = await tx.customer.findFirst({
            where: { phone },
            select: { id: true },
          });

          const createdCustomer = existing
            ? existing
            : await tx.customer.create({
                data: {
                  name,
                  phone,
                  whatsapp: customer.whatsapp ? String(customer.whatsapp) : phone,
                  email: customer.email ? String(customer.email) : null,
                  address: customer.address ? String(customer.address) : null,
                },
                select: { id: true },
              });

          resolvedCustomerId = createdCustomer.id;
        }

        const allowedSources = ["admin", "store", "pos", "repair", "system"];
        if (!allowedSources.includes(String(source || "admin").toLowerCase())) {
          const error = new Error("Invalid order source");
          error.statusCode = 400;
          error.code = "INVALID_SOURCE";
          throw error;
        }

        /* -----------------------------------------
           Validate products
        ----------------------------------------- */

        for (
          const rawItem of
            items
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
                price: true,
                purchasePrice: true,
                stock: true,
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

            error.statusCode =
              400;

            error.code =
              "INVALID_QUANTITY";

            throw error;
          }


          if (
            product.stock <
            quantity
          ) {
            const error =
              new Error(
                `Insufficient stock for product: ${product.name}`
              );

            error.statusCode =
              409;

            error.code =
              "INSUFFICIENT_STOCK";

            throw error;
          }


          const unitPrice =
            Number(
              product.price
            );

          const lineTotal =
            unitPrice *
            quantity;

          subtotal +=
            lineTotal;


          preparedItems.push({
            productId:
              product.id,

            name:
              product.name,

            sku:
              product.sku,

            quantity,

            unitPrice,

            total:
              lineTotal,

            costPrice:
              product.purchasePrice == null
                ? 0
                : Number(product.purchasePrice),
          });
        }


        /* -----------------------------------------
           Discount
        ----------------------------------------- */

        const discountAmount =
          Number(
            discount || 0
          );


        if (
          !Number.isFinite(
            discountAmount
          ) ||
          discountAmount < 0
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
          discountAmount >
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
          discountAmount;


        /* -----------------------------------------
           Create order
        ----------------------------------------- */

        let createdOrder = null;

        for (
          let attempt = 1;
          attempt <= 5;
          attempt++
        ) {
          try {
            createdOrder =
              await tx.order.create({
                data: {
                  orderNumber:
                    generateOrderNumber(),

                  customerId:
                    resolvedCustomerId ||
                    null,

              status:
                "PENDING",

              paymentMethod:
                paymentMethod ||
                "WHATSAPP",

              subtotal,

              discount:
                discountAmount,

              total,

              source:
                source ||
                "admin",

              notes:
                notes ||
                null,

              stockApplied:
                false,

              paidAmount:
                0,

              remainingAmount:
                total,

              paymentStatus:
                total > 0
                  ? "UNPAID"
                  : "PAID",

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

                      unitPrice:
                        item.unitPrice,

                      costPrice:
                        item.costPrice,

                      total:
                        item.total,
                    })
                  ),
              },
            },

                include:
                  orderInclude,
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
                const uniqueError =
                  new Error(
                    "Could not generate a unique order number"
                  );

                uniqueError.statusCode =
                  409;

                uniqueError.code =
                  "ORDER_NUMBER_COLLISION";

                throw uniqueError;
              }

              throw error;
            }
          }
        }

        if (!createdOrder) {
          const error =
            new Error(
              "Could not create order"
            );

          error.statusCode = 500;
          error.code = "ORDER_CREATE_FAILED";

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
              -item.quantity,

            type:
              "SALE",

            userId:
              userId || null,

            note:
              `Order ${createdOrder.orderNumber}`,
          });
        }


        /* -----------------------------------------
           Mark stock as applied
        ----------------------------------------- */

        await tx.order.update({
          where: {
            id:
              createdOrder.id,
          },

          data: {
            stockApplied:
              true,
            ...(String(source || "").toLowerCase() === "pos"
              ? { status: "COMPLETED" }
              : {}),
          },
        });


        await syncOrderPaymentState(
          tx,
          createdOrder.id
        );

        await tx.notification.create({
          data: {
            title: "طلب جديد",
            message: `تم إنشاء الطلب ${createdOrder.orderNumber}`,
            type: "order",
            entityType: "order",
            entityId: createdOrder.id,
            priority: "normal",
            source: "system",
            metadata: { orderNumber: createdOrder.orderNumber, source },
          },
        });

        return tx.order.findUnique({
          where: {
            id:
              createdOrder.id,
          },

          include:
            orderInclude,
        });
      }
    );


  return serializeOrder(
    order
  );
}


/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

export async function updateOrderStatus(
  id,
  status,
  userId = null
) {
  const result =
    await prisma.$transaction(
      async (tx) => {
        const order =
          await tx.order.findUnique({
            where: {
              id,
            },

            include:
              orderInclude,
          });


        if (!order) {
          const error =
            new Error(
              "Order not found"
            );

          error.statusCode =
            404;

          error.code =
            "NOT_FOUND";

          throw error;
        }


        /* -----------------------------------------
           Already cancelled
        ----------------------------------------- */

        if (
          order.status ===
          "CANCELLED"
        ) {
          const error =
            new Error(
              "Cannot update a cancelled order"
            );

          error.statusCode =
            409;

          error.code =
            "ORDER_CANCELLED";

          throw error;
        }


        /* -----------------------------------------
           Already completed
        ----------------------------------------- */

        if (
          order.status ===
          "COMPLETED"
        ) {
          const error =
            new Error(
              "Cannot update a completed order"
            );

          error.statusCode =
            409;

          error.code =
            "ORDER_COMPLETED";

          throw error;
        }


        /* -----------------------------------------
           CANCEL ORDER
        ----------------------------------------- */

        if (
          status ===
          "CANCELLED"
        ) {
          /*
            1. Reverse inventory.
          */

          if (
            order.stockApplied
          ) {
            for (
              const item of
                order.items
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
                  item.quantity,

                type:
                  "RETURN_IN",

                userId:
                  userId || null,

                note:
                  `Cancel order ${order.orderNumber}`,
              });
            }
          }


          /*
            2. Mark order cancelled.
          */

          await tx.order.update({
            where: {
              id,
            },

            data: {
              status:
                "CANCELLED",

              stockApplied:
                false,
            },
          });


          /*
            3. Reverse every original positive
               payment against its own ledger entry.
          */

          const positivePayments =
            order.payments.filter(
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
                `Cancel order payment ${order.orderNumber}`,
            });
          }


          /*
            5. Recalculate the denormalized
               financial snapshot from the ledger.
          */

          await syncOrderPaymentState(
            tx,
            order.id
          );


          return tx.order.findUnique({
            where: {
              id,
            },

            include:
              orderInclude,
          });
        }


        /* -----------------------------------------
           STATUS TRANSITIONS
        ----------------------------------------- */

        const allowedTransitions = {
          PENDING: [
            "CONFIRMED",
            "CANCELLED",
          ],

          CONFIRMED: [
            "PREPARING",
            "CANCELLED",
          ],

          PREPARING: [
            "READY",
            "CANCELLED",
          ],

          READY: [
            "COMPLETED",
            "CANCELLED",
          ],
        };


        const allowedNextStatuses =
          allowedTransitions[
            order.status
          ] || [];


        if (
          !allowedNextStatuses.includes(
            status
          )
        ) {
          const error =
            new Error(
              `Invalid order status transition from ${order.status} to ${status}`
            );

          error.statusCode =
            409;

          error.code =
            "INVALID_STATUS_TRANSITION";

          throw error;
        }


        const updatedOrder =
          await tx.order.update({
            where: {
              id,
            },

            data: {
              status,
            },
          });


        await syncOrderPaymentState(
          tx,
          updatedOrder.id
        );


        return tx.order.findUnique({
          where: {
            id:
              updatedOrder.id,
          },

          include:
            orderInclude,
        });
      }
    );


  return serializeOrder(
    result
  );
}