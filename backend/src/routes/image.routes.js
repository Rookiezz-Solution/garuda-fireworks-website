import { Router } from "express";
import {
  addImageController,
  deleteImageController,
  updateImageController,
} from "../controllers/image.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = Router();

router.post("/", authMiddleware, adminMiddleware, addImageController);
router.put("/:id", authMiddleware, adminMiddleware, updateImageController);
router.delete("/:id", authMiddleware, adminMiddleware, deleteImageController);

export default router;
