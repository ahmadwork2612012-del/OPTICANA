import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { adminGlobalSearch } from "../controllers/search.controller.js";

const router = Router();
router.use(requireAuth, requireRole("ADMIN", "SUPER_ADMIN", "STAFF"));
router.get("/", adminGlobalSearch);
export default router;
