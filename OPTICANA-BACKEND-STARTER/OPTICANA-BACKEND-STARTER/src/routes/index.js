import { Router } from "express";

import supplierRouter from "./supplier.routes.js";
import healthRouter from "./health.routes.js";
import productRouter from "./product.routes.js";
import authRouter from "./auth.routes.js";
import adminProductRouter from "./admin-product.routes.js";
import settingsRouter from "./settings.routes.js";
import categoryRouter from "./category.routes.js";
import customerRouter from "./customer.routes.js";
import orderRouter from "./order.routes.js";
import inventoryRouter from "./inventory.routes.js";
import reviewRouter from "./review.routes.js";
import purchaseRouter from "./purchase.routes.js";
import paymentRouter from "./payment.routes.js";
import expenseRouter from "./expense.routes.js";
import repairRouter from "./repair.routes.js";
import notificationRouter from "./notification.routes.js";
import mediaRouter from "./media.routes.js";
import publicOrderRouter from "./public-order.routes.js";
import userRouter from "./user.routes.js";
import reportRouter from "./report.routes.js";
import searchRouter from "./search.routes.js";

const router = Router();

router.use(
  "/api/admin/suppliers",
  supplierRouter
);
router.use("/api", healthRouter);
router.use("/api/products", productRouter);
router.use("/api/auth", authRouter);
router.use("/api/admin/products", adminProductRouter);
router.use("/api", settingsRouter);
router.use("/api/categories", categoryRouter);
router.use("/api/admin/customers", customerRouter);
router.use("/api/admin/orders", orderRouter);
router.use("/api/admin/inventory", inventoryRouter);
router.use("/api/reviews", reviewRouter);
router.use(
  "/api/admin/purchases",
  purchaseRouter
);
router.use(
  "/api/admin/payments",
  paymentRouter
);
router.use("/api/admin/expenses", expenseRouter);
router.use("/api/admin/repairs", repairRouter);
router.use("/api/admin/notifications", notificationRouter);
router.use("/api/admin/media", mediaRouter);
router.use("/api/admin/users", userRouter);
router.use("/api/admin/reports", reportRouter);
router.use("/api/admin/search", searchRouter);
router.use("/api/orders", publicOrderRouter);

export default router;
