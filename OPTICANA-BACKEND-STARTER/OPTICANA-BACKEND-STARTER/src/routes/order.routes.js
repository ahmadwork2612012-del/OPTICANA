import { Router } from "express";

import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

import {
  adminListOrders,
  adminGetOrder,
  adminCreateOrder,
  adminUpdateOrderStatus,
} from "../controllers/order.controller.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN", "SUPER_ADMIN", "STAFF"));

router.get("/", adminListOrders);
router.get("/:id", adminGetOrder);
router.post("/", adminCreateOrder);
router.patch("/:id/status", adminUpdateOrderStatus);

export default router;
