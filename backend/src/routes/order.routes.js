import { Router } from "express";
import {
  createOrderController,
  deleteOrderController,
  getOrderByIdController,
  getOrdersController,
  updateOrderStatusController,
} from "../controllers/order.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, getOrdersController);
router.get("/:id", authMiddleware, adminMiddleware, getOrderByIdController);
router.post("/", createOrderController);
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatusController);
router.delete("/:id", authMiddleware, adminMiddleware, deleteOrderController);

export default router;
