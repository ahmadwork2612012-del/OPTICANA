import {Router} from "express";
import {requireAuth,requireRole} from "../middleware/auth.middleware.js";
import {adminReportSummary} from "../controllers/report.controller.js";
const router=Router();
router.use(requireAuth,requireRole("ADMIN","SUPER_ADMIN"));
router.get("/summary",adminReportSummary);
export default router;
