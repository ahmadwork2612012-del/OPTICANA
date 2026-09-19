import {
  listPurchases,
  getPurchaseById,
  createPurchase,
  createDraftPurchase,
  receivePurchase,
  updatePurchase,
  voidPurchase,
  deletePurchase,
} from "../services/purchase.service.js";

import {
  createPurchaseSchema,
  updatePurchaseSchema,
  voidPurchaseSchema,
} from "../validators/purchase.validator.js";


export async function adminListPurchases(
  req,
  res,
  next
) {
  try {
    const purchases =
      await listPurchases();

    res.json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    next(error);
  }
}


export async function adminGetPurchase(
  req,
  res,
  next
) {
  try {
    const purchase =
      await getPurchaseById(
        req.params.id
      );

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

    res.json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
}


export async function adminCreatePurchase(
  req,
  res,
  next
) {
  try {
    const parsed =
      createPurchaseSchema.safeParse(
        req.body
      );

    if (!parsed.success) {
      const error =
        new Error(
          "Invalid purchase data"
        );

      error.statusCode =
        400;

      error.code =
        "VALIDATION_ERROR";

      error.details =
        parsed.error.flatten();

      throw error;
    }

    const purchase =
      await createPurchase(
        parsed.data,
        req.user?.id
      );

    res.status(201).json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
}



export async function adminCreateDraftPurchase(
  req,
  res,
  next
) {
  try {
    const parsed =
      createPurchaseSchema.safeParse(
        {
          ...req.body,
          paidAmount: 0,
        }
      );

    if (!parsed.success) {
      const error =
        new Error("Invalid draft purchase data");

      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      error.details =
        parsed.error.flatten();

      throw error;
    }

    const purchase =
      await createDraftPurchase(
        parsed.data,
        req.user?.id
      );

    res.status(201).json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
}


export async function adminReceivePurchase(
  req,
  res,
  next
) {
  try {
    const paymentData = {
      paidAmount:
        Number(
          req.body?.paidAmount || 0
        ),

      paymentMethod:
        req.body?.paymentMethod ||
        "CASH",
    };

    const purchase =
      await receivePurchase(
        req.params.id,
        paymentData,
        req.user?.id
      );

    res.json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
}



export async function adminUpdatePurchase(
  req,
  res,
  next
) {
  try {
    const parsed =
      updatePurchaseSchema.safeParse(
        req.body
      );

    if (!parsed.success) {
      const error =
        new Error(
          "Invalid purchase data"
        );

      error.statusCode =
        400;

      error.code =
        "VALIDATION_ERROR";

      error.details =
        parsed.error.flatten();

      throw error;
    }

    const purchase =
      await updatePurchase(
        req.params.id,
        parsed.data
      );

    res.json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
}


export async function adminVoidPurchase(
  req,
  res,
  next
) {
  try {
    const parsed =
      voidPurchaseSchema.safeParse(
        req.body || {}
      );

    if (!parsed.success) {
      const error =
        new Error(
          "Invalid void data"
        );

      error.statusCode =
        400;

      error.code =
        "VALIDATION_ERROR";

      error.details =
        parsed.error.flatten();

      throw error;
    }

    const purchase =
      await voidPurchase(
        req.params.id,
        parsed.data.reason || "",
        req.user?.id
      );

    res.json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
}


export async function adminDeletePurchase(
  req,
  res,
  next
) {
  try {
    const result =
      await deletePurchase(
        req.params.id
      );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}