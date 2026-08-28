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

router.use(requireAuth, requireRole("ADMIN", "SUPER_ADMIN"));

router.get("/", adminListCustomers);
router.get("/:id", adminGetCustomer);
router.post("/", adminCreateCustomer);
router.patch("/:id", adminUpdateCustomer);
router.delete("/:id", adminDeleteCustomer);

export default router;
