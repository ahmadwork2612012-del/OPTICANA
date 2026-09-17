import { Router } from "express";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";

import {
  adminListPurchases,
  adminGetPurchase,
  adminCreatePurchase,
  adminCreateDraftPurchase,
  adminReceivePurchase,
  adminUpdatePurchase,
  adminVoidPurchase,
  adminDeletePurchase,
} from "../controllers/purchase.controller.js";


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
  adminListPurchases
);



router.post(
  "/draft",
  adminCreateDraftPurchase
);


router.post(
  "/:id/receive",
  adminReceivePurchase
);



router.get(
  "/:id",
  adminGetPurchase
);


router.post(
  "/",
  adminCreatePurchase
);


router.patch(
  "/:id",
  adminUpdatePurchase
);


router.post(
  "/:id/void",
  requireRole("ADMIN", "SUPER_ADMIN"),
  adminVoidPurchase
);


router.delete(
  "/:id",
  requireRole("ADMIN", "SUPER_ADMIN"),
  adminDeletePurchase
);


export default router;