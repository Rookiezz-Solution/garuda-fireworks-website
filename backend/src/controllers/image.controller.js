import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addImageController = async (req, res, next) => {
  try {
    const { productId, imageUrl } = req.body ?? {};
    const pid = Number(productId);
    if (!Number.isInteger(pid) || !imageUrl) {
      const error = new Error("productId and imageUrl are required");
      error.statusCode = 400;
      throw error;
    }

    const product = await prisma.product.findFirst({
      where: { id: pid, isAvailable: true },
    });
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    const image = await prisma.image.create({
      data: { productId: pid, imageUrl, isActive: true },
    });

    return res.status(201).json({
      success: true,
      message: "Image added successfully",
      data: { image },
    });
  } catch (error) {
    next(error);
  }
};

export const updateImageController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid image id");
      error.statusCode = 400;
      throw error;
    }

    const { imageUrl, isActive } = req.body ?? {};
    const image = await prisma.image.update({
      where: { id },
      data: {
        imageUrl: imageUrl ?? undefined,
        isActive: isActive === undefined ? undefined : Boolean(isActive),
      },
    });

    return res.json({
      success: true,
      message: "Image updated successfully",
      data: { image },
    });
  } catch (error) {
    if (error?.code === "P2025") {
      error.statusCode = 404;
      error.message = "Image not found";
    }
    next(error);
  }
};

export const deleteImageController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid image id");
      error.statusCode = 400;
      throw error;
    }

    const image = await prisma.image.update({
      where: { id },
      data: { isActive: false },
    });

    return res.json({
      success: true,
      message: "Image deleted successfully",
      data: { image },
    });
  } catch (error) {
    if (error?.code === "P2025") {
      error.statusCode = 404;
      error.message = "Image not found";
    }
    next(error);
  }
};
