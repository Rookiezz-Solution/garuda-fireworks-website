import { Router } from "express";
import {
  createEnquiryController,
  getEnquiriesController,
  getEnquiryByIdController,
  updateEnquiryStatusController,
} from "../controllers/enquiry.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = Router();

router.post("/", createEnquiryController);
router.get("/", authMiddleware, adminMiddleware, getEnquiriesController);
router.get("/:id", authMiddleware, adminMiddleware, getEnquiryByIdController);
router.put("/:id/status", authMiddleware, adminMiddleware, updateEnquiryStatusController);

export default router;
