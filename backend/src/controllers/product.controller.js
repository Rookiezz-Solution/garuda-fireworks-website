import { PrismaClient, Prisma } from "@prisma/client";
import { deleteImage, uploadImage } from "../utils/supabaseStorage.js";

const prisma = new PrismaClient();

const includeConfig = {
  images: {
    where: { isActive: true },
    select: { id: true, imageUrl: true },
  },
  category: {
    select: { id: true, name: true },
  },
};

const toDecimal = (value, fieldName) => {
  if (value === undefined || value === null || value === "") return null;
  const decimal = new Prisma.Decimal(value);
  if (!decimal.isFinite()) {
    const error = new Error(`${fieldName} must be a valid number`);
    error.statusCode = 400;
    throw error;
  }
  return decimal;
};

export const getProductsController = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === "admin";
    const { search, categoryId, category, sort, page, limit } = req.query ?? {};

    const where = {
      isActive: true, // never return soft-deleted products
    };

    if (!isAdmin) where.isAvailable = true;

    const categoryValue = categoryId !== undefined ? categoryId : category;
    if (categoryValue !== undefined && categoryValue !== null && categoryValue !== "") {
      const cid = Number(categoryValue);
      if (!Number.isInteger(cid)) {
        const error = new Error("Invalid categoryId");
        error.statusCode = 400;
        throw error;
      }
      where.categoryId = cid;
    }

    if (search) {
      where.name = { contains: String(search).trim(), mode: "insensitive" };
    }

    const orderBy = (() => {
      const s = String(sort ?? "").toLowerCase();
      if (s === "price_low")  return [{ actualPrice: "asc" }];
      if (s === "price_high") return [{ actualPrice: "desc" }];
      if (s === "price_asc")  return [{ actualPrice: "asc" }];
      if (s === "price_desc") return [{ actualPrice: "desc" }];
      if (s === "featured")   return [{ isFeatured: "desc" }, { id: "desc" }];
      return [{ id: "desc" }]; // default: newest
    })();

    const take =
      limit === undefined || limit === null || limit === "" ? undefined : Number(limit);
    const pageNum =
      page === undefined || page === null || page === "" ? 1 : Number(page);
    const skip = take
      ? Math.max(0, (Number.isFinite(pageNum) ? pageNum : 1) - 1) * take
      : undefined;

    const products = await prisma.product.findMany({
      where,
      include: includeConfig,
      orderBy,
      ...(take ? { take } : {}),
      ...(skip !== undefined ? { skip } : {}),
    });

    return res.json({
      success: true,
      message: "Products fetched successfully",
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProductsController = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isAvailable: true, isFeatured: true, isActive: true },
      include: includeConfig,
      orderBy: { id: "desc" },
    });

    return res.json({
      success: true,
      message: "Featured products fetched successfully",
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductByIdController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid product id");
      error.statusCode = 400;
      throw error;
    }

    const isAdmin = req.user?.role === "admin";
    const product = await prisma.product.findFirst({
      where: {
        id,
        isActive: true,
        ...(isAdmin ? {} : { isAvailable: true }),
      },
      include: includeConfig,
    });

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    return res.json({
      success: true,
      message: "Product fetched successfully",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const createProductController = async (req, res, next) => {
  try {
    const {
      name,
      description,
      actualPrice,
      offerPrice,
      isCoupon,
      couponPrice,
      isFeatured,
      isAvailable,
      tags,
      categoryId,
      imageUrl,
      createdBy,
    } = req.body ?? {};

    if (!name || actualPrice === undefined || actualPrice === null) {
      const error = new Error("Name and actualPrice are required");
      error.statusCode = 400;
      throw error;
    }

    const cid =
      categoryId === undefined || categoryId === null || categoryId === ""
        ? null
        : Number(categoryId);
    if (cid !== null && !Number.isInteger(cid)) {
      const error = new Error("categoryId must be a valid integer");
      error.statusCode = 400;
      throw error;
    }

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name,
          description: description ?? null,
          actualPrice: toDecimal(actualPrice, "actualPrice"),
          offerPrice: toDecimal(offerPrice, "offerPrice"),
          isCoupon: Boolean(isCoupon),
          couponPrice: toDecimal(couponPrice, "couponPrice"),
          isFeatured: Boolean(isFeatured),
          isAvailable: isAvailable === undefined ? true : Boolean(isAvailable),
          isActive: true,
          tags: tags ?? null,
          categoryId: cid,
          createdBy: createdBy ?? null,
        },
      });

      const uploadedUrl = req.file ? await uploadImage(req.file) : null;
      const finalImageUrl = uploadedUrl ?? (imageUrl ? String(imageUrl) : null);

      if (finalImageUrl) {
        await tx.image.create({
          data: { productId: created.id, imageUrl: finalImageUrl, isActive: true },
        });
      }

      return tx.product.findFirst({
        where: { id: created.id },
        include: includeConfig,
      });
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid product id");
      error.statusCode = 400;
      throw error;
    }

    const {
      name,
      description,
      actualPrice,
      offerPrice,
      isCoupon,
      couponPrice,
      isFeatured,
      isAvailable,
      tags,
      categoryId,
      imageUrl,
      clearImage,
      modifiedBy,
    } = req.body ?? {};

    if (actualPrice === null) {
      const error = new Error("actualPrice cannot be null");
      error.statusCode = 400;
      throw error;
    }

    const cid =
      categoryId === undefined || categoryId === null || categoryId === ""
        ? undefined
        : Number(categoryId);
    if (cid !== undefined && !Number.isInteger(cid)) {
      const error = new Error("categoryId must be a valid integer");
      error.statusCode = 400;
      throw error;
    }

    let oldImageUrlToDelete = null;

    const product = await prisma.$transaction(async (tx) => {
      const hasNewUpload = Boolean(req.file);
      const hasImageUrlField = imageUrl !== undefined;
      const wantsClear = String(clearImage || "").toLowerCase() === "true";
      const shouldUpdateImage = hasNewUpload || hasImageUrlField || wantsClear;

      let uploadedUrl = null;
      if (hasNewUpload) {
        uploadedUrl = await uploadImage(req.file);
      }

      let previousActiveImage = null;
      if (shouldUpdateImage) {
        previousActiveImage = await tx.image.findFirst({
          where: { productId: id, isActive: true },
          orderBy: { id: "desc" },
        });
      }

      await tx.product.update({
        where: { id },
        data: {
          name:        name === undefined ? undefined : name,
          description: description === undefined ? undefined : description,
          actualPrice: actualPrice === undefined ? undefined : toDecimal(actualPrice, "actualPrice"),
          offerPrice:  offerPrice === undefined ? undefined : toDecimal(offerPrice, "offerPrice"),
          isCoupon:    isCoupon === undefined ? undefined : Boolean(isCoupon),
          couponPrice: couponPrice === undefined ? undefined : toDecimal(couponPrice, "couponPrice"),
          isFeatured:  isFeatured === undefined ? undefined : Boolean(isFeatured),
          isAvailable: isAvailable === undefined ? undefined : Boolean(isAvailable),
          tags:        tags === undefined ? undefined : tags,
          categoryId:  cid,
          modifiedBy:  modifiedBy === undefined ? undefined : modifiedBy,
        },
      });

      if (shouldUpdateImage) {
        if (wantsClear) {
          await tx.image.deleteMany({ where: { productId: id } });
        } else {
          await tx.image.updateMany({
            where: { productId: id, isActive: true },
            data: { isActive: false },
          });
          const finalImageUrl = uploadedUrl ?? (imageUrl ? String(imageUrl) : null);
          if (finalImageUrl) {
            await tx.image.create({
              data: { productId: id, imageUrl: finalImageUrl, isActive: true },
            });
          }
        }
      }

      if (hasNewUpload && previousActiveImage?.imageUrl) {
        oldImageUrlToDelete = previousActiveImage.imageUrl;
      }
      if (wantsClear && previousActiveImage?.imageUrl) {
        oldImageUrlToDelete = previousActiveImage.imageUrl;
      }

      return tx.product.findFirst({
        where: { id },
        include: includeConfig,
      });
    });

    if (oldImageUrlToDelete) await deleteImage(oldImageUrlToDelete);

    return res.json({
      success: true,
      message: "Product updated successfully",
      data: { product },
    });
  } catch (error) {
    if (error?.code === "P2025") {
      error.statusCode = 404;
      error.message = "Product not found";
    }
    next(error);
  }
};

// ─── SOFT DELETE via isActive ────────────────────────────────────────────────
// Sets isActive = false so the product disappears from all listings.
// isAvailable is LEFT unchanged so stock status is preserved if ever restored.
export const deleteProductController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid product id");
      error.statusCode = 400;
      throw error;
    }

    // Verify it exists and is not already deleted
    const existing = await prisma.product.findFirst({
      where: { id, isActive: true },
    });
    if (!existing) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    // Soft-delete: flip isActive to false
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return res.json({
      success: true,
      message: "Product deleted successfully",
      data: { id },
    });
  } catch (error) {
    if (error?.code === "P2025") {
      error.statusCode = 404;
      error.message = "Product not found";
    }
    next(error);
  }
};
