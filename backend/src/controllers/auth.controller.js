import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../utils/generateToken.js";
import { generateOtp } from "../utils/generateOtp.js";

const prisma = new PrismaClient();

const normalizeIdentifier = ({ identifier, email, phone }) => {
  const raw = identifier ?? email ?? phone;
  if (!raw) return null;
  const value = String(raw).trim();
  if (!value) return null;
  const isEmail = value.includes("@");
  return { value, type: isEmail ? "email" : "phone" };
};

export const sendOtpController = async (req, res, next) => {
  try {
    const identifier = normalizeIdentifier(req.body ?? {});
    if (!identifier) {
      const error = new Error("identifier is required");
      error.statusCode = 400;
      throw error;
    }

    const { otp, expiry } = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.oTPLog.create({
      data: {
        identifier: identifier.value,
        otp: hashedOtp,
        expiresAt: expiry,
      },
    });

    console.log(`OTP for ${identifier.type} ${identifier.value}: ${otp}`);

    return res.json({
      success: true,
      message: "OTP sent",
      data: { expiresAt: expiry },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtpController = async (req, res, next) => {
  try {
    const identifier = normalizeIdentifier(req.body ?? {});
    const { otp } = req.body ?? {};
    if (!identifier || !otp) {
      const error = new Error("identifier and otp are required");
      error.statusCode = 400;
      throw error;
    }

    const otpLog = await prisma.oTPLog.findFirst({
      where: {
        identifier: identifier.value,
        verified: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdOn: "desc" },
    });

    if (!otpLog) {
      const error = new Error("Invalid OTP");
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await bcrypt.compare(String(otp), otpLog.otp);
    if (!isMatch) {
      const error = new Error("Invalid OTP");
      error.statusCode = 400;
      throw error;
    }

    const where =
      identifier.type === "email"
        ? { email: identifier.value }
        : { phone: identifier.value };

    let user = await prisma.user.findFirst({ where });
    if (!user) {
      const adminCount = await prisma.user.count({ where: { role: "admin", isActive: true } });
      if (adminCount === 0) {
        user = await prisma.user.create({
          data: {
            name: "Admin",
            role: "admin",
            email: identifier.type === "email" ? identifier.value : null,
            phone: identifier.type === "phone" ? identifier.value : null,
          },
        });
      } else {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }
    }

    if (user.role !== "admin") {
      const error = new Error("Forbidden");
      error.statusCode = 403;
      throw error;
    }

    await prisma.oTPLog.update({
      where: { id: otpLog.id },
      data: { verified: true },
    });

    const token = generateToken(user);

    return res.json({
      success: true,
      message: "OTP verified",
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
};

export const registerController = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body ?? {};
    if (!name || !password || (!email && !phone)) {
      const error = new Error("Name, password and email/phone are required");
      error.statusCode = 400;
      throw error;
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: email ?? undefined }, { phone: phone ?? undefined }] },
    });
    if (existing) {
      const error = new Error("User already exists");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email ?? null,
        phone: phone ?? null,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user },
    });
  } catch (error) {
    console.log("Register error:", error);
    console.log("Error stack:", error?.stack);
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body ?? {};
    if ((!email && !phone) || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/phone and password are required",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email || "" }, { phone: phone || "" }],
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (!user.password) {
      return res.status(401).json({ success: false, message: "No password set for this user" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    let effectiveUser = user;
    if (user.role !== "admin" && user.email === "admin@garudafireworks.com") {
      effectiveUser = await prisma.user.update({
        where: { id: user.id },
        data: { role: "admin" },
      });
    }

    const token = generateToken(effectiveUser);
    return res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: effectiveUser.id,
          name: effectiveUser.name,
          email: effectiveUser.email,
          role: effectiveUser.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const meController = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Current user fetched successfully",
      data: { user: req.user },
    });
  } catch (error) {
    next(error);
  }
};
