import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const toDecimal = (value, field) => {
  if (value === undefined || value === null || value === "") return null;
  const d = new Prisma.Decimal(value);
  if (!d.isFinite()) {
    const error = new Error(`${field} must be a valid number`);
    error.statusCode = 400;
    throw error;
  }
  return d;
};

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdOn: "desc" } });
    return res.json({ success: true, message: "Coupons fetched", data: { coupons } });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxUses,
      expiryDate,
      isActive,
    } = req.body ?? {};

    if (!code || String(code).trim().length === 0) {
      const error = new Error("code is required");
      error.statusCode = 400;
      throw error;
    }

    const dt = discountType ? String(discountType) : "percentage";
    if (!["percentage", "fixed"].includes(dt)) {
      const error = new Error("discountType must be percentage or fixed");
      error.statusCode = 400;
      throw error;
    }

    const dv = toDecimal(discountValue, "discountValue");
    if (!dv) {
      const error = new Error("discountValue is required");
      error.statusCode = 400;
      throw error;
    }

    const codeUpper = String(code).trim().toUpperCase();

    const coupon = await prisma.coupon.create({
      data: {
        code: codeUpper,
        description: description ?? null,
        discountType: dt,
        discountValue: dv,
        minOrderValue: toDecimal(minOrderValue, "minOrderValue"),
        maxUses: maxUses === undefined || maxUses === null || maxUses === "" ? null : Number(maxUses),
        expiryDate: expiryDate ? new Date(String(expiryDate)) : null,
        isActive: isActive === undefined ? true : Boolean(isActive),
      },
    });

    return res.status(201).json({ success: true, message: "Coupon created", data: { coupon } });
  } catch (error) {
    if (error?.code === "P2002") {
      error.statusCode = 400;
      error.message = "Coupon code already exists";
    }
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid coupon id");
      error.statusCode = 400;
      throw error;
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxUses,
      usedCount,
      expiryDate,
      isActive,
    } = req.body ?? {};

    const dt = discountType === undefined ? undefined : String(discountType);
    if (dt !== undefined && !["percentage", "fixed"].includes(dt)) {
      const error = new Error("discountType must be percentage or fixed");
      error.statusCode = 400;
      throw error;
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: code === undefined ? undefined : String(code).trim().toUpperCase(),
        description: description === undefined ? undefined : description,
        discountType: dt,
        discountValue: discountValue === undefined ? undefined : toDecimal(discountValue, "discountValue"),
        minOrderValue: minOrderValue === undefined ? undefined : toDecimal(minOrderValue, "minOrderValue"),
        maxUses:
          maxUses === undefined ? undefined : maxUses === null || maxUses === "" ? null : Number(maxUses),
        usedCount: usedCount === undefined ? undefined : Number(usedCount),
        expiryDate: expiryDate === undefined ? undefined : expiryDate ? new Date(String(expiryDate)) : null,
        isActive: isActive === undefined ? undefined : Boolean(isActive),
      },
    });

    return res.json({ success: true, message: "Coupon updated", data: { coupon } });
  } catch (error) {
    if (error?.code === "P2002") {
      error.statusCode = 400;
      error.message = "Coupon code already exists";
    }
    if (error?.code === "P2025") {
      error.statusCode = 404;
      error.message = "Coupon not found";
    }
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid coupon id");
      error.statusCode = 400;
      throw error;
    }
    await prisma.coupon.delete({ where: { id } });
    return res.json({ success: true, message: "Coupon deleted", data: {} });
  } catch (error) {
    if (error?.code === "P2025") {
      error.statusCode = 404;
      error.message = "Coupon not found";
    }
    next(error);
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body ?? {};
    if (!code || String(code).trim().length === 0) {
      const error = new Error("code is required");
      error.statusCode = 400;
      throw error;
    }
    const total = toDecimal(orderTotal, "orderTotal");
    if (!total) {
      const error = new Error("orderTotal is required");
      error.statusCode = 400;
      throw error;
    }

    const coupon = await prisma.coupon.findFirst({
      where: { code: String(code).trim().toUpperCase() },
    });
    if (!coupon) return res.status(404).json({ success: false, message: "Invalid coupon code" });
    if (!coupon.isActive) return res.status(400).json({ success: false, message: "Coupon is inactive" });
    if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: "Coupon expired" });
    }
    if (coupon.maxUses !== null && coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    }
    if (coupon.minOrderValue && total.lt(coupon.minOrderValue)) {
      return res.status(400).json({ success: false, message: "Order total too low for this coupon" });
    }

    let discountAmount = new Prisma.Decimal(0);
    if (coupon.discountType === "percentage") {
      discountAmount = total.mul(coupon.discountValue).div(100);
    } else {
      discountAmount = coupon.discountValue;
    }
    if (discountAmount.gt(total)) discountAmount = total;

    const finalTotal = total.minus(discountAmount);

    return res.json({
      success: true,
      message: "Coupon valid",
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalTotal,
      },
    });
  } catch (error) {
    next(error);
  }
};

