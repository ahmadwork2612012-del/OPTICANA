import { Router } from "express";

import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

import {
  publicListCategories,
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "../controllers/category.controller.js";

const router = Router();

// Public - يقرأها الموقع
router.get("/", publicListCategories);

// Admin - محمية
router.get(
  "/admin",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  adminListCategories
);

router.post(
  "/admin",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  adminCreateCategory
);

router.patch(
  "/admin/:id",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  adminUpdateCategory
);

router.delete(
  "/admin/:id",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  adminDeleteCategory
);

export default router;
