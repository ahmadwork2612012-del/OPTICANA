import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  getManagerOrders,
  getManagerStoreData,
  updateManagerContent,
  updateManagerSetting,
} from "../controllers/manager-dashboard.controller.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN", "SUPER_ADMIN"));
router.get("/store-data", getManagerStoreData);
router.put("/settings/:key", updateManagerSetting);
router.put("/content/:key", updateManagerContent);
router.get("/orders", getManagerOrders);

export default router;
