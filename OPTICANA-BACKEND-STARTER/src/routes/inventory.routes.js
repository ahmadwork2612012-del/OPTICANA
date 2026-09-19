import {
  Router,
} from "express";


import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";


import {
  adminListInventoryMovements,
  adminAdjustInventory,
} from "../controllers/inventory.controller.js";


const router =
  Router();


router.use(
  requireAuth,
  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
    "STAFF"
  )
);


/* =====================================
   MOVEMENTS
===================================== */

router.get(
  "/",
  adminListInventoryMovements
);


/* =====================================
   MANUAL ADJUSTMENT
===================================== */

router.post(
  "/:productId/adjust",
  requireRole("ADMIN", "SUPER_ADMIN"),
  adminAdjustInventory
);


export default router;