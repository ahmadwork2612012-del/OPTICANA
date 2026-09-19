import { Router } from "express";

import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

import {
  adminListCustomers,
  adminGetCustomer,
  adminCreateCustomer,
  adminUpdateCustomer,
  adminDeleteCustomer,
} from "../controllers/customer.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", requireRole("ADMIN", "SUPER_ADMIN", "STAFF"), adminListCustomers);
router.get("/:id", requireRole("ADMIN", "SUPER_ADMIN", "STAFF"), adminGetCustomer);
router.post("/", requireRole("ADMIN", "SUPER_ADMIN"), adminCreateCustomer);
router.patch("/:id", requireRole("ADMIN", "SUPER_ADMIN"), adminUpdateCustomer);
router.delete("/:id", requireRole("ADMIN", "SUPER_ADMIN"), adminDeleteCustomer);

export default router;
