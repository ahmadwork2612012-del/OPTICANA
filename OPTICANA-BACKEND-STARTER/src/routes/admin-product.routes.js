import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/auth.middleware.js";

import {
  adminListProducts,
  adminGetProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from "../controllers/admin-product.controller.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN", "SUPER_ADMIN"));

router.get("/", adminListProducts);
router.get("/:id", adminGetProduct);
router.post("/", requireRole("ADMIN", "SUPER_ADMIN"), adminCreateProduct);
router.patch("/:id", requireRole("ADMIN", "SUPER_ADMIN"), adminUpdateProduct);
router.delete("/:id", requireRole("ADMIN", "SUPER_ADMIN"), adminDeleteProduct);

export default router;
