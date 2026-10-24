import { Router } from "express";
import { rateLimit } from "../middleware/rateLimit.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";

import {
  publicSubmitReview,
  publicListApprovedReviews,
  publicListProductReviews,
  adminListReviews,
  adminUpdateReviewStatus,
  adminDeleteReview,
} from "../controllers/review.controller.js";

const router = Router();

/*
  Public
*/

// Submit a review
router.post(
  "/",
  rateLimit({ windowMs: 10 * 60_000, max: 5, message: "تقييمات كثيرة، حاول بعد قليل" }),
  publicSubmitReview
);

// Get all approved reviews
router.get("/", publicListApprovedReviews);

// Get approved reviews for a product
router.get(
  "/product/:productId",
  publicListProductReviews
);


/*
  Admin
*/

router.get(
  "/admin",
  requireAuth,
  requireRole(
    "ADMIN",
    "SUPER_ADMIN"
  ),
  adminListReviews
);

router.patch(
  "/admin/:id/status",
  requireAuth,
  requireRole(
    "ADMIN",
    "SUPER_ADMIN"
  ),
  adminUpdateReviewStatus
);

router.delete(
  "/admin/:id",
  requireAuth,
  requireRole(
    "ADMIN",
    "SUPER_ADMIN"
  ),
  adminDeleteReview
);

export default router;