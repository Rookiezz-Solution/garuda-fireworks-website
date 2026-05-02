import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
  validateCoupon,
} from "../controllers/coupon.controller.js";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, getCoupons);
router.post("/", authMiddleware, adminMiddleware, createCoupon);
router.put("/:id", authMiddleware, adminMiddleware, updateCoupon);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCoupon);
router.post("/validate", validateCoupon);

export default router;

