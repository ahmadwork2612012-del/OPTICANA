import { Router } from "express";
import { rateLimit } from "../middleware/rateLimit.js";
import { publicCreateOrder } from "../controllers/public-order.controller.js";

const router = Router();
router.post("/", rateLimit({ windowMs: 60_000, max: 30, message: "طلبات كثيرة، حاول بعد قليل" }), publicCreateOrder);
export default router;
