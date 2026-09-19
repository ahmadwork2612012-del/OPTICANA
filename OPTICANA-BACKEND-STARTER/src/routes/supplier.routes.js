import { Router } from "express";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";

import {
  adminListSuppliers,
  adminGetSupplier,
  adminCreateSupplier,
  adminUpdateSupplier,
  adminDeleteSupplier,
} from "../controllers/supplier.controller.js";


const router = Router();


router.use(
  requireAuth,
  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
    "STAFF"
  )
);


router.get(
  "/",
  adminListSuppliers
);

router.get(
  "/:id",
  adminGetSupplier
);

router.post(
  "/",
  requireRole("ADMIN", "SUPER_ADMIN"),
  adminCreateSupplier
);

router.patch(
  "/:id",
  requireRole("ADMIN", "SUPER_ADMIN"),
  adminUpdateSupplier
);

router.delete(
  "/:id",
  requireRole("ADMIN", "SUPER_ADMIN"),
  adminDeleteSupplier
);


export default router;