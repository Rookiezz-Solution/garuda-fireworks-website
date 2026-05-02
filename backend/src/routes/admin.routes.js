import { Router } from "express";
import { getDashboardController } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = Router();

router.get("/dashboard", authMiddleware, adminMiddleware, getDashboardController);

export default router;
