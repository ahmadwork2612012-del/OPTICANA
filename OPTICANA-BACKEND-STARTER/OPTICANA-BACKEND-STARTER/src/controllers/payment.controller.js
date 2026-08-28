import {
  recordPayment,
  listPayments,
  getSupplierPayments,
  getPurchasePayments,
} from "../services/payment.service.js";

import {
  createPaymentSchema,
} from "../validators/payment.validator.js";


/* =========================================================
   CREATE PAYMENT
========================================================= */

export async function adminCreatePayment(
  req,
  res,
  next
) {
  try {
    const parsed =
      createPaymentSchema.safeParse(
        req.body
      );


    if (!parsed.success) {
      const error =
        new Error(
          "Invalid payment data"
        );

      error.statusCode =
        400;

      error.code =
        "VALIDATION_ERROR";

      error.details =
        parsed.error.flatten();

      throw error;
    }


    const payment =
      await recordPayment({
        ...parsed.data,
        createdById: req.user?.id || null,
      });


    res.status(201).json({
      success: true,
      data: payment,
    });

  } catch (error) {
    next(error);
  }
}


/* =========================================================
   LIST PAYMENTS
========================================================= */

export async function adminListPayments(
  req,
  res,
  next
) {
  try {
    const {
      supplierId,
      purchaseId,
      customerId,
      orderId,
      expenseId,
      type,
    } = req.query;


    const payments =
      await listPayments({
        supplierId:
          supplierId ||
          undefined,

        purchaseId:
          purchaseId ||
          undefined,

        customerId:
          customerId ||
          undefined,

        orderId:
          orderId ||
          undefined,

        expenseId:
          expenseId ||
          undefined,

        type:
          type ||
          undefined,
      });


    res.json({
      success: true,
      data: payments,
    });

  } catch (error) {
    next(error);
  }
}


/* =========================================================
   SUPPLIER PAYMENTS
========================================================= */

export async function adminListSupplierPayments(
  req,
  res,
  next
) {
  try {
    const {
      supplierId,
    } = req.params;


    if (!supplierId) {
      const error =
        new Error(
          "Supplier id is required"
        );

      error.statusCode =
        400;

      error.code =
        "SUPPLIER_ID_REQUIRED";

      throw error;
    }


    const payments =
      await getSupplierPayments(
        supplierId
      );


    res.json({
      success: true,
      data: payments,
    });

  } catch (error) {
    next(error);
  }
}


/* =========================================================
   PURCHASE PAYMENTS
========================================================= */

export async function adminListPurchasePayments(
  req,
  res,
  next
) {
  try {
    const {
      purchaseId,
    } = req.params;


    if (!purchaseId) {
      const error =
        new Error(
          "Purchase id is required"
        );

      error.statusCode =
        400;

      error.code =
        "PURCHASE_ID_REQUIRED";

      throw error;
    }


    const payments =
      await getPurchasePayments(
        purchaseId
      );


    res.json({
      success: true,
      data: payments,
    });

  } catch (error) {
    next(error);
  }
}