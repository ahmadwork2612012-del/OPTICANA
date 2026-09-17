import prisma from "../lib/prisma.js";
import { writeAudit } from "./audit.service.js";


/* =========================================================
   CONSTANTS / HELPERS
========================================================= */

const PAYMENT_TYPES = new Set([
  "SALE_PAYMENT",
  "PURCHASE_PAYMENT",
  "EXPENSE_PAYMENT",
  "REPAIR_PAYMENT",
  "OTHER",
]);

const PAYMENT_METHODS = new Set([
  "CASH",
  "WHATSAPP",
  "CARD",
  "ONLINE",
  "OTHER",
]);


function createError(
  message,
  statusCode,
  code
) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}


function normalizeMoney(value) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return NaN;
  }

  return Math.round((numeric + Number.EPSILON) * 100) / 100;
}


function serializePayment(payment) {
  if (!payment) {
    return null;
  }

  return {
    id: payment.id,

    amount: Number(payment.amount || 0),

    type: payment.type,

    method: payment.method,

    source: payment.source,

    customerId: payment.customerId || null,

    supplierId: payment.supplierId || null,

    orderId: payment.orderId || null,

    purchaseId: payment.purchaseId || null,

    expenseId: payment.expenseId || null,
    repairId: payment.repairId || null,

    createdById:
      payment.createdById || null,

    reversedPaymentId:
      payment.reversedPaymentId || null,

    note: payment.note || null,

    createdAt: payment.createdAt,

    updatedAt: payment.updatedAt,

    supplier: payment.supplier
      ? {
          id: payment.supplier.id,
          name: payment.supplier.name,
        }
      : null,

    purchase: payment.purchase
      ? {
          id: payment.purchase.id,
          invoiceNumber: payment.purchase.invoiceNumber,
        }
      : null,
  };
}


/* =========================================================
   PAYMENT STATUS
========================================================= */

export function getPaymentStatus(
  total,
  paidAmount
) {
  const safeTotal = normalizeMoney(total);
  const safePaid = normalizeMoney(paidAmount);

  if (!Number.isFinite(safeTotal) || safeTotal <= 0) {
    return "PAID";
  }

  if (!Number.isFinite(safePaid) || safePaid <= 0) {
    return "UNPAID";
  }

  if (safePaid >= safeTotal) {
    return "PAID";
  }

  return "PARTIAL";
}


/* =========================================================
   PAYMENT TARGET HELPERS
========================================================= */

function getPaymentTargets({
  orderId,
  purchaseId,
  expenseId,
  repairId,
}) {
  return [
    orderId ? "orderId" : null,
    purchaseId ? "purchaseId" : null,
    expenseId ? "expenseId" : null,
    repairId ? "repairId" : null,
  ].filter(Boolean);
}


function validateBasicPaymentInput({
  amount,
  type,
  method,
}) {
  const numericAmount = normalizeMoney(amount);

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    throw createError(
      "Payment amount must be greater than zero",
      400,
      "INVALID_PAYMENT_AMOUNT"
    );
  }

  if (!PAYMENT_TYPES.has(type)) {
    throw createError(
      "Invalid payment type",
      400,
      "INVALID_PAYMENT_TYPE"
    );
  }

  if (!PAYMENT_METHODS.has(method)) {
    throw createError(
      "Invalid payment method",
      400,
      "INVALID_PAYMENT_METHOD"
    );
  }

  return numericAmount;
}


function validateTypeAgainstTargets({
  type,
  orderId,
  purchaseId,
  expenseId,
  repairId,
}) {
  const targetCount = getPaymentTargets({
    orderId,
    purchaseId,
    expenseId,
    repairId,
  }).length;

  if (type === "SALE_PAYMENT") {
    if (targetCount !== 1 || !orderId) {
      throw createError(
        "SALE_PAYMENT requires exactly one orderId target",
        400,
        "INVALID_PAYMENT_TARGET"
      );
    }
    return;
  }

  if (type === "PURCHASE_PAYMENT") {
    if (targetCount !== 1 || !purchaseId) {
      throw createError(
        "PURCHASE_PAYMENT requires exactly one purchaseId target",
        400,
        "INVALID_PAYMENT_TARGET"
      );
    }
    return;
  }

  if (type === "EXPENSE_PAYMENT") {
    if (targetCount !== 1 || !expenseId) {
      throw createError(
        "EXPENSE_PAYMENT requires exactly one expenseId target",
        400,
        "INVALID_PAYMENT_TARGET"
      );
    }
    return;
  }

  if (type === "REPAIR_PAYMENT") {
    if (targetCount !== 1 || !repairId) {
      throw createError(
        "REPAIR_PAYMENT requires exactly one repairId target",
        400,
        "INVALID_PAYMENT_TARGET"
      );
    }
    return;
  }

  if (type === "OTHER") {
    if (targetCount !== 0) {
      throw createError(
        "OTHER payments cannot be attached to an order, purchase, expense, or repair",
        400,
        "INVALID_PAYMENT_TARGET"
      );
    }
  }
}


/* =========================================================
   PURCHASE PAYMENT SUMMARY
========================================================= */

export async function getPurchasePaymentSummary(
  tx = prisma,
  purchaseId
) {
  const aggregate =
    await tx.payment.aggregate({
      where: {
        purchaseId,
      },

      _sum: {
        amount: true,
      },
    });

  return {
    paidAmount: normalizeMoney(
      aggregate._sum.amount || 0
    ),
  };
}


/* =========================================================
   ORDER PAYMENT SUMMARY
========================================================= */

export async function getOrderPaymentSummary(
  tx = prisma,
  orderId
) {
  const aggregate =
    await tx.payment.aggregate({
      where: {
        orderId,
      },

      _sum: {
        amount: true,
      },
    });

  return {
    paidAmount: normalizeMoney(
      aggregate._sum.amount || 0
    ),
  };
}


/* =========================================================
   REPAIR PAYMENT SUMMARY
========================================================= */

export async function getRepairPaymentSummary(
  tx = prisma,
  repairId
) {
  const aggregate =
    await tx.payment.aggregate({
      where: {
        repairId,
      },
      _sum: {
        amount: true,
      },
    });

  return {
    paidAmount: normalizeMoney(
      aggregate._sum.amount || 0
    ),
  };
}


/* =========================================================
   SYNC REPAIR PAYMENT STATE
========================================================= */

export async function syncRepairPaymentState(
  tx,
  repairId
) {
  const repair =
    await tx.repair.findUnique({
      where: {
        id: repairId,
      },
      select: {
        id: true,
        estimatedCost: true,
        finalCost: true,
        status: true,
      },
    });

  if (!repair) {
    throw createError(
      "Repair not found",
      404,
      "REPAIR_NOT_FOUND"
    );
  }

  const { paidAmount } =
    await getRepairPaymentSummary(
      tx,
      repairId
    );

  const normalizedPaid =
    Math.max(
      normalizeMoney(paidAmount),
      0
    );

  return tx.repair.update({
    where: {
      id: repairId,
    },
    data: {
      paidAmount: normalizedPaid,
    },
  });
}


/* =========================================================
   LIST PAYMENTS
========================================================= */

export async function listPayments({
  supplierId,
  purchaseId,
  customerId,
  orderId,
  expenseId,
  type,
} = {}) {
  const payments =
    await prisma.payment.findMany({
      where: {
        ...(supplierId !== undefined
          ? { supplierId: supplierId || null }
          : {}),

        ...(purchaseId !== undefined
          ? { purchaseId: purchaseId || null }
          : {}),

        ...(customerId !== undefined
          ? { customerId: customerId || null }
          : {}),

        ...(orderId !== undefined
          ? { orderId: orderId || null }
          : {}),

        ...(expenseId !== undefined
          ? { expenseId: expenseId || null }
          : {}),

        ...(type
          ? { type }
          : {}),
      },

      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },

        purchase: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 200,
    });

  return payments.map(serializePayment);
}


/* =========================================================
   SUPPLIER / PURCHASE HISTORY
========================================================= */

export async function getSupplierPayments(
  supplierId
) {
  return listPayments({
    supplierId,
  });
}


export async function getPurchasePayments(
  purchaseId
) {
  return listPayments({
    purchaseId,
  });
}


/* =========================================================
   SYNC PURCHASE PAYMENT STATE
========================================================= */

export async function syncPurchasePaymentState(
  tx,
  purchaseId
) {
  const purchase =
    await tx.purchase.findUnique({
      where: {
        id: purchaseId,
      },

      select: {
        id: true,
        total: true,
        status: true,
      },
    });

  if (!purchase) {
    throw createError(
      "Purchase not found",
      404,
      "PURCHASE_NOT_FOUND"
    );
  }

  const { paidAmount } =
    await getPurchasePaymentSummary(
      tx,
      purchaseId
    );

  const total =
    normalizeMoney(purchase.total);

  const normalizedPaidAmount =
    Math.max(
      normalizeMoney(paidAmount),
      0
    );

  const remainingAmount =
    Math.max(
      normalizeMoney(total - normalizedPaidAmount),
      0
    );

  const paymentStatus =
    purchase.status === "VOID"
      ? "UNPAID"
      : getPaymentStatus(
          total,
          normalizedPaidAmount
        );

  return tx.purchase.update({
    where: {
      id: purchaseId,
    },

    data: {
      paidAmount: normalizedPaidAmount,
      remainingAmount,
      paymentStatus,
    },
  });
}


/* =========================================================
   SYNC ORDER PAYMENT STATE
========================================================= */

export async function syncOrderPaymentState(
  tx,
  orderId
) {
  const order =
    await tx.order.findUnique({
      where: {
        id: orderId,
      },

      select: {
        id: true,
        total: true,
        status: true,
      },
    });

  if (!order) {
    throw createError(
      "Order not found",
      404,
      "ORDER_NOT_FOUND"
    );
  }

  const { paidAmount } =
    await getOrderPaymentSummary(
      tx,
      orderId
    );

  const total =
    normalizeMoney(order.total);

  const normalizedPaidAmount =
    Math.max(
      normalizeMoney(paidAmount),
      0
    );

  const remainingAmount =
    order.status === "CANCELLED"
      ? 0
      : Math.max(
          normalizeMoney(total - normalizedPaidAmount),
          0
        );

  const paymentStatus =
    order.status === "CANCELLED"
      ? "UNPAID"
      : getPaymentStatus(
          total,
          normalizedPaidAmount
        );

  return tx.order.update({
    where: {
      id: orderId,
    },

    data: {
      paidAmount: normalizedPaidAmount,
      remainingAmount,
      paymentStatus,
    },
  });
}


/* =========================================================
   RECORD PAYMENT
========================================================= */

export async function recordPayment({
  tx = prisma,

  amount,

  type = "OTHER",

  method = "CASH",

  source = "admin",

  customerId = null,

  supplierId = null,

  orderId = null,

  purchaseId = null,

  expenseId = null,

  repairId = null,

  createdById = null,

  note = null,
}) {
  const numericAmount =
    validateBasicPaymentInput({
      amount,
      type,
      method,
    });


  validateTypeAgainstTargets({
    type,
    orderId,
    purchaseId,
    expenseId,
    repairId,
  });


  let resolvedCustomerId =
    customerId || null;

  let resolvedSupplierId =
    supplierId || null;


  /* -----------------------------------------
     ORDER
  ----------------------------------------- */

  if (orderId) {
    const order =
      await tx.order.findUnique({
        where: {
          id: orderId,
        },

        select: {
          id: true,
          customerId: true,
          total: true,
          status: true,
        },
      });

    if (!order) {
      throw createError(
        "Order not found",
        404,
        "ORDER_NOT_FOUND"
      );
    }

    if (order.status === "CANCELLED") {
      throw createError(
        "Cannot add payment to a cancelled order",
        409,
        "ORDER_CANCELLED"
      );
    }

    /*
      Customer identity comes from the order,
      not from untrusted frontend input.
    */

    if (
      resolvedCustomerId &&
      order.customerId &&
      resolvedCustomerId !== order.customerId
    ) {
      throw createError(
        "Customer does not match order",
        409,
        "CUSTOMER_MISMATCH"
      );
    }

    resolvedCustomerId =
      order.customerId || null;


    const {
      paidAmount: existingPaidAmount,
    } =
      await getOrderPaymentSummary(
        tx,
        orderId
      );

    const remaining =
      Math.max(
        normalizeMoney(order.total) -
          Math.max(
            normalizeMoney(existingPaidAmount),
            0
          ),
        0
      );

    if (numericAmount > remaining) {
      throw createError(
        "Payment exceeds order remaining amount",
        409,
        "PAYMENT_EXCEEDS_REMAINING"
      );
    }
  }


  /* -----------------------------------------
     PURCHASE
  ----------------------------------------- */

  if (purchaseId) {
    const purchase =
      await tx.purchase.findUnique({
        where: {
          id: purchaseId,
        },

        select: {
          id: true,
          supplierId: true,
          status: true,
          total: true,
        },
      });

    if (!purchase) {
      throw createError(
        "Purchase not found",
        404,
        "PURCHASE_NOT_FOUND"
      );
    }

    if (purchase.status === "VOID") {
      throw createError(
        "Cannot add payment to a void purchase",
        409,
        "PURCHASE_VOID"
      );
    }

    if (purchase.status === "DRAFT") {
      throw createError(
        "Cannot add payment to a draft purchase",
        409,
        "DRAFT_PAYMENT_NOT_ALLOWED"
      );
    }

    if (
      resolvedSupplierId &&
      purchase.supplierId &&
      resolvedSupplierId !== purchase.supplierId
    ) {
      throw createError(
        "Supplier does not match purchase",
        409,
        "SUPPLIER_MISMATCH"
      );
    }

    resolvedSupplierId =
      purchase.supplierId || null;


    const {
      paidAmount: existingPaidAmount,
    } =
      await getPurchasePaymentSummary(
        tx,
        purchaseId
      );

    const remaining =
      Math.max(
        normalizeMoney(purchase.total) -
          Math.max(
            normalizeMoney(existingPaidAmount),
            0
          ),
        0
      );

    if (numericAmount > remaining) {
      throw createError(
        "Payment exceeds purchase remaining amount",
        409,
        "PAYMENT_EXCEEDS_REMAINING"
      );
    }
  }


  /* -----------------------------------------
     EXPENSE
  ----------------------------------------- */

  if (expenseId) {
    const expense =
      await tx.expense.findUnique({
        where: {
          id: expenseId,
        },

        select: {
          id: true,
          amount: true,
        },
      });

    if (!expense) {
      throw createError(
        "Expense not found",
        404,
        "EXPENSE_NOT_FOUND"
      );
    }

    const {
      paidAmount,
    } =
      await tx.payment.aggregate({
        where: {
          expenseId,
        },

        _sum: {
          amount: true,
        },
      });

    const existingPaid =
      Math.max(
        normalizeMoney(
          paidAmount || 0
        ),
        0
      );

    const remaining =
      Math.max(
        normalizeMoney(expense.amount) -
          existingPaid,
        0
      );

    if (numericAmount > remaining) {
      throw createError(
        "Payment exceeds expense remaining amount",
        409,
        "PAYMENT_EXCEEDS_REMAINING"
      );
    }
  }



  /* -----------------------------------------
     REPAIR
  ----------------------------------------- */

  if (repairId) {
    const repair =
      await tx.repair.findUnique({
        where: {
          id: repairId,
        },
        select: {
          id: true,
          customerId: true,
          status: true,
          estimatedCost: true,
          finalCost: true,
        },
      });

    if (!repair) {
      throw createError(
        "Repair not found",
        404,
        "REPAIR_NOT_FOUND"
      );
    }

    if (repair.status === "CANCELLED") {
      throw createError(
        "Cannot add payment to a cancelled repair",
        409,
        "REPAIR_CANCELLED"
      );
    }

    if (
      resolvedCustomerId &&
      repair.customerId &&
      resolvedCustomerId !== repair.customerId
    ) {
      throw createError(
        "Customer does not match repair",
        409,
        "CUSTOMER_MISMATCH"
      );
    }

    resolvedCustomerId =
      repair.customerId || null;

    const {
      paidAmount: existingPaidAmount,
    } =
      await getRepairPaymentSummary(
        tx,
        repairId
      );

    const total =
      normalizeMoney(
        Number(repair.finalCost) > 0
          ? repair.finalCost
          : repair.estimatedCost
      );

    const remaining =
      Math.max(
        total -
          Math.max(
            normalizeMoney(
              existingPaidAmount
            ),
            0
          ),
        0
      );

    if (numericAmount > remaining) {
      throw createError(
        "Payment exceeds repair remaining amount",
        409,
        "PAYMENT_EXCEEDS_REMAINING"
      );
    }
  }

  /* -----------------------------------------
     CREATE
  ----------------------------------------- */

  const payment =
    await tx.payment.create({
      data: {
        amount: numericAmount,

        type,

        method,

        source: String(
          source || "admin"
        ).trim(),

        customerId:
          resolvedCustomerId,

        supplierId:
          resolvedSupplierId,

        orderId:
          orderId || null,

        purchaseId:
          purchaseId || null,

        expenseId:
          expenseId || null,

        repairId:
          repairId || null,

        createdById:
          createdById || null,

        note:
          note || null,
      },
    });


  /* -----------------------------------------
     SYNC PARENT
  ----------------------------------------- */

  if (purchaseId) {
    await syncPurchasePaymentState(
      tx,
      purchaseId
    );
  }

  if (orderId) {
    await syncOrderPaymentState(
      tx,
      orderId
    );
  }

  if (repairId) {
    await syncRepairPaymentState(
      tx,
      repairId
    );
  }

  await tx.notification.create({
    data: {
      title: "دفعة مالية",
      message: `تم تسجيل دفعة بقيمة ${numericAmount.toFixed(2)}`,
      type: "payment",
      entityType: "payment",
      entityId: payment.id,
      priority: "normal",
      source: "system",
      metadata: { paymentType: type, target: { orderId, purchaseId, expenseId, repairId } },
      userId: createdById || null,
    },
  });

  await writeAudit({
    tx,
    userId: createdById,
    action: "CREATE",
    entityType: "PAYMENT",
    entityId: payment.id,
    after: payment,
  });

  return serializePayment(payment);
}


/* =========================================================
   REVERSE PAYMENT
========================================================= */

export async function reversePayment({
  tx = prisma,

  originalPaymentId,

  amount = null,

  source = "admin",

  createdById = null,

  note = null,
}) {
  if (!originalPaymentId) {
    throw createError(
      "originalPaymentId is required for a payment reversal",
      400,
      "ORIGINAL_PAYMENT_REQUIRED"
    );
  }

  const originalPayment =
    await tx.payment.findUnique({
      where: {
        id: originalPaymentId,
      },
      select: {
        id: true,
        amount: true,
        type: true,
        method: true,
        customerId: true,
        supplierId: true,
        orderId: true,
        purchaseId: true,
        expenseId: true,
        repairId: true,
        reversedPaymentId: true,
      },
    });

  if (!originalPayment) {
    throw createError(
      "Original payment not found",
      404,
      "ORIGINAL_PAYMENT_NOT_FOUND"
    );
  }

  if (Number(originalPayment.amount) <= 0) {
    throw createError(
      "Only positive payments can be reversed",
      409,
      "INVALID_ORIGINAL_PAYMENT"
    );
  }

  if (originalPayment.reversedPaymentId) {
    throw createError(
      "A reversal entry cannot itself be reversed",
      409,
      "INVALID_REVERSAL_TARGET"
    );
  }

  const targetCount =
    getPaymentTargets({
      orderId:
        originalPayment.orderId,
      purchaseId:
        originalPayment.purchaseId,
      expenseId:
        originalPayment.expenseId,
      repairId:
        originalPayment.repairId,
    }).length;

  if (
    originalPayment.type !== "OTHER" &&
    targetCount !== 1
  ) {
    throw createError(
      "Original payment has an invalid ledger target",
      409,
      "INVALID_ORIGINAL_PAYMENT"
    );
  }

  const requestedAmount =
    amount === null ||
    amount === undefined
      ? normalizeMoney(
          originalPayment.amount
        )
      : normalizeMoney(amount);

  if (
    !Number.isFinite(requestedAmount) ||
    requestedAmount <= 0
  ) {
    throw createError(
      "Reversal amount must be greater than zero",
      400,
      "INVALID_REVERSAL_AMOUNT"
    );
  }

  const reversalAggregate =
    await tx.payment.aggregate({
      where: {
        reversedPaymentId:
          originalPayment.id,
      },
      _sum: {
        amount: true,
      },
    });

  const alreadyReversed =
    Math.max(
      normalizeMoney(
        Math.abs(
          Number(
            reversalAggregate._sum.amount ||
            0
          )
        )
      ),
      0
    );

  const remainingReversible =
    Math.max(
      normalizeMoney(
        Number(
          originalPayment.amount
        ) -
          alreadyReversed
      ),
      0
    );

  if (
    requestedAmount >
    remainingReversible
  ) {
    throw createError(
      "Reversal exceeds the remaining reversible amount of the original payment",
      409,
      "REVERSAL_EXCEEDS_ORIGINAL"
    );
  }

  const payment =
    await tx.payment.create({
      data: {
        amount:
          -requestedAmount,

        type:
          originalPayment.type,

        method:
          originalPayment.method,

        source: String(
          source || "admin"
        ).trim(),

        customerId:
          originalPayment.customerId ||
          null,

        supplierId:
          originalPayment.supplierId ||
          null,

        orderId:
          originalPayment.orderId ||
          null,

        purchaseId:
          originalPayment.purchaseId ||
          null,

        expenseId:
          originalPayment.expenseId ||
          null,

        repairId:
          originalPayment.repairId ||
          null,

        createdById:
          createdById || null,

        reversedPaymentId:
          originalPayment.id,

        note:
          note || null,
      },
    });

  if (originalPayment.purchaseId) {
    await syncPurchasePaymentState(
      tx,
      originalPayment.purchaseId
    );
  }

  if (originalPayment.orderId) {
    await syncOrderPaymentState(
      tx,
      originalPayment.orderId
    );
  }

  if (originalPayment.repairId) {
    await syncRepairPaymentState(
      tx,
      originalPayment.repairId
    );
  }

  await writeAudit({
    tx,
    userId: createdById,
    action: "REVERSE",
    entityType: "PAYMENT",
    entityId: payment.id,
    before: originalPayment,
    after: payment,
    metadata: { reversedPaymentId: originalPayment.id },
  });

  return serializePayment(
    payment
  );
}

