import { Router } from "express";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";

import {
  adminCreatePayment,
  adminListPayments,
  adminListSupplierPayments,
  adminListPurchasePayments,
} from "../controllers/payment.controller.js";


const router = Router();


router.use(
  requireAuth,
  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
    "STAFF"
  )
);


/* =====================================
   ALL PAYMENTS
===================================== */

router.get(
  "/",
  adminListPayments
);


/* =====================================
   SUPPLIER PAYMENTS
===================================== */

router.get(
  "/supplier/:supplierId",
  adminListSupplierPayments
);


/* =====================================
   PURCHASE PAYMENTS
===================================== */

router.get(
  "/purchase/:purchaseId",
  adminListPurchasePayments
);


/* =====================================
   CREATE PAYMENT
===================================== */

router.post(
  "/",
  requireRole("ADMIN", "SUPER_ADMIN"),
  adminCreatePayment
);


export default router;