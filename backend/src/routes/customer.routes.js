import { Router } from "express";
import {
  createCustomerController,
  deleteCustomerController,
  getCustomerByIdController,
  getCustomersController,
  updateCustomerController,
} from "../controllers/customer.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, getCustomersController);
router.get("/:id", authMiddleware, adminMiddleware, getCustomerByIdController);
router.post("/", authMiddleware, adminMiddleware, createCustomerController);
router.put("/:id", authMiddleware, adminMiddleware, updateCustomerController);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCustomerController);

export default router;
