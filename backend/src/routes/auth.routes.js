import { Router } from "express";
import {
  loginController,
  meController,
  registerController,
  sendOtpController,
  verifyOtpController,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/send-otp", sendOtpController);
router.post("/verify-otp", verifyOtpController);
router.post("/register", registerController);
router.post("/login", loginController);
router.get("/me", authMiddleware, meController);

export default router;
