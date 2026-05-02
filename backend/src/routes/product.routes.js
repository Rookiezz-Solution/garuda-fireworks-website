import { Router } from "express";
import {
  createProductController,
  deleteProductController,
  getFeaturedProductsController,
  getProductByIdController,
  getProductsController,
  updateProductController,
} from "../controllers/product.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import { optionalAuthMiddleware } from "../middleware/optionalAuth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = Router();

router.get("/", optionalAuthMiddleware, getProductsController);
router.get("/featured", getFeaturedProductsController);
router.get("/:id", optionalAuthMiddleware, getProductByIdController);
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), createProductController);
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), updateProductController);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProductController);

export default router;
