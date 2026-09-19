import { Router } from "express";

import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

import {
  publicGetSettings,
  publicGetContent,
  adminUpdateSetting,
  adminUpdateContent,
} from "../controllers/settings.controller.js";

const router = Router();

// Public - يقرأها الموقع (الستور) بدون تسجيل دخول
router.get("/settings", publicGetSettings);
router.get("/content", publicGetContent);

// Admin - محمية، يعدلها الأدمن بس
router.put(
  "/admin/settings/:key",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  adminUpdateSetting
);

router.put(
  "/admin/content/:key",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  adminUpdateContent
);

export default router;
