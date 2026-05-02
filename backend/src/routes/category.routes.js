import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return res.json({
      success: true,
      message: "Categories fetched successfully",
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { name, description } = req.body ?? {};
    if (!name || String(name).trim().length === 0) {
      const error = new Error("name is required");
      error.statusCode = 400;
      throw error;
    }

    const category = await prisma.category.create({
      data: { name: String(name).trim(), description: description ?? null },
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: { category },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      error.statusCode = 400;
      error.message = "Category name already exists";
    }
    next(error);
  }
});

router.put("/:id", authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid category id");
      error.statusCode = 400;
      throw error;
    }

    const { name, description, isActive } = req.body ?? {};
    if (name !== undefined && String(name).trim().length === 0) {
      const error = new Error("name cannot be empty");
      error.statusCode = 400;
      throw error;
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name === undefined ? undefined : String(name).trim(),
        description: description === undefined ? undefined : description,
        isActive: isActive === undefined ? undefined : Boolean(isActive),
      },
    });

    return res.json({
      success: true,
      message: "Category updated successfully",
      data: { category },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      error.statusCode = 400;
      error.message = "Category name already exists";
    }
    if (error?.code === "P2025") {
      error.statusCode = 404;
      error.message = "Category not found";
    }
    next(error);
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid category id");
      error.statusCode = 400;
      throw error;
    }

    const category = await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    return res.json({
      success: true,
      message: "Category deleted successfully",
      data: { category },
    });
  } catch (error) {
    if (error?.code === "P2025") {
      error.statusCode = 404;
      error.message = "Category not found";
    }
    next(error);
  }
});

export default router;
