import {
  submitReview,
  getApprovedReviews,
  getApprovedReviewsForProduct,
  listAllReviews,
  updateReviewStatus,
  deleteReview,
} from "../services/review.service.js";

import {
  submitReviewSchema,
  updateReviewStatusSchema,
} from "../validators/review.validator.js";


/* =====================================
   PUBLIC: SUBMIT REVIEW
===================================== */

export async function publicSubmitReview(
  req,
  res,
  next
) {
  try {
    const parsed =
      submitReviewSchema.safeParse(
        req.body
      );

    if (!parsed.success) {
      const error =
        new Error(
          "Invalid review data"
        );

      error.statusCode = 400;
      error.code =
        "VALIDATION_ERROR";

      error.details =
        parsed.error.flatten();

      throw error;
    }

    const review =
      await submitReview(
        parsed.data
      );

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
}


/* =====================================
   PUBLIC: LIST APPROVED REVIEWS
===================================== */

export async function publicListApprovedReviews(
  req,
  res,
  next
) {
  try {
    res.json({
      success: true,
      data: await getApprovedReviews(),
    });
  } catch (error) {
    next(error);
  }
}


export async function publicListProductReviews(
  req,
  res,
  next
) {
  try {
    const reviews =
      await getApprovedReviewsForProduct(
        req.params.productId
      );

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
}


/* =====================================
   ADMIN: LIST ALL REVIEWS
===================================== */

export async function adminListReviews(
  req,
  res,
  next
) {
  try {
    const reviews =
      await listAllReviews();

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
}


/* =====================================
   ADMIN: UPDATE REVIEW STATUS
===================================== */

export async function adminUpdateReviewStatus(
  req,
  res,
  next
) {
  try {
    const parsed =
      updateReviewStatusSchema.safeParse(
        req.body
      );

    if (!parsed.success) {
      const error =
        new Error(
          "Invalid status"
        );

      error.statusCode = 400;
      error.code =
        "VALIDATION_ERROR";

      error.details =
        parsed.error.flatten();

      throw error;
    }

    const review =
      await updateReviewStatus(
        req.params.id,
        parsed.data.status,
        req.user.id,
        parsed.data.featured
      );

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
}


/* =====================================
   ADMIN: DELETE REVIEW
===================================== */

export async function adminDeleteReview(
  req,
  res,
  next
) {
  try {
    const result =
      await deleteReview(
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