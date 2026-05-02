import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const getOrdersController = async (req, res, next) => {
  try {
    const { search, status, startDate, endDate } = req.query ?? {};

    const where = { isActive: true };
    if (status) where.status = String(status);

    if (startDate || endDate) {
      const gte = startDate ? new Date(String(startDate)) : undefined;
      const lte = endDate ? new Date(String(endDate)) : undefined;
      if ((gte && Number.isNaN(gte.getTime())) || (lte && Number.isNaN(lte.getTime()))) {
        const error = new Error("Invalid date range");
        error.statusCode = 400;
        throw error;
      }
      where.createdOn = {
        ...(gte ? { gte } : {}),
        ...(lte ? { lte } : {}),
      };
    }

    if (search) {
      const s = String(search).trim();
      const numericId = Number(s);
      if (Number.isInteger(numericId) && String(numericId) === s) {
        where.id = numericId;
      } else {
        where.customer = { name: { contains: s, mode: "insensitive" } };
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: { include: { product: { include: { category: true } } } },
      },
      orderBy: { id: "desc" },
    });

    return res.json({
      success: true,
      message: "Orders fetched successfully",
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderByIdController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid order id");
      error.statusCode = 400;
      throw error;
    }

    const order = await prisma.order.findFirst({
      where: { id, isActive: true },
      include: {
        customer: true,
        user: true,
        items: { include: { product: { include: { category: true, images: { where: { isActive: true } } } } } },
      },
    });

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    return res.json({
      success: true,
      message: "Order fetched successfully",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const createOrderController = async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const items = body.items;
    if (!Array.isArray(items) || items.length === 0) {
      const error = new Error("items array is required");
      error.statusCode = 400;
      throw error;
    }

    const normalizedItems = items.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
      price: item.price === undefined || item.price === null ? null : new Prisma.Decimal(item.price),
    }));

    if (
      normalizedItems.some(
        (it) =>
          !Number.isInteger(it.productId) ||
          !Number.isInteger(it.quantity) ||
          it.quantity <= 0 ||
          (it.price && !it.price.isFinite()),
      )
    ) {
      const error = new Error("Each item must have valid productId and quantity (and optional price)");
      error.statusCode = 400;
      throw error;
    }

    const productIds = [...new Set(normalizedItems.map((it) => it.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isAvailable: true },
    });

    if (products.length !== productIds.length) {
      const error = new Error("One or more products not found");
      error.statusCode = 404;
      throw error;
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let computedTotal = new Prisma.Decimal(0);
    const orderItemData = normalizedItems.map((it) => {
      const product = productMap.get(it.productId);
      const unitPrice = it.price ?? product.offerPrice ?? product.actualPrice;
      computedTotal = computedTotal.plus(unitPrice.times(it.quantity));
      return { productId: it.productId, quantity: it.quantity, price: unitPrice };
    });

    const total =
      body.total === undefined || body.total === null || body.total === ""
        ? computedTotal
        : new Prisma.Decimal(body.total);
    if (!total.isFinite()) {
      const error = new Error("total must be a valid number");
      error.statusCode = 400;
      throw error;
    }

    let customerId = null;
    if (body.customerId !== undefined && body.customerId !== null && body.customerId !== "") {
      const cid = Number(body.customerId);
      if (!Number.isInteger(cid)) {
        const error = new Error("customerId must be a valid integer");
        error.statusCode = 400;
        throw error;
      }
      customerId = cid;
    } else {
      const customerName = body.customerName || body.name;
      const customerPhone = body.customerPhone || body.phone;
      const customerEmail = body.customerEmail || body.email || null;
      const deliveryAddress = body.deliveryAddress || body.address || null;

      if (!customerName || !customerPhone) {
        const error = new Error("customerName and customerPhone are required");
        error.statusCode = 400;
        throw error;
      }

      const customer = await prisma.customer.upsert({
        where: { phone: String(customerPhone) },
        update: {
          name: String(customerName),
          email: customerEmail,
          deliveryAddress,
          isActive: true,
        },
        create: {
          name: String(customerName),
          phone: String(customerPhone),
          email: customerEmail,
          deliveryAddress,
          isActive: true,
        },
      });
      customerId = customer.id;
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerId,
          userId: req.user?.id ?? null,
          status: "ordered",
          total,
        },
      });

      await tx.orderItem.createMany({
        data: orderItemData.map((it) => ({ ...it, orderId: order.id })),
      });

      return tx.order.findFirst({
        where: { id: order.id },
        include: {
          customer: true,
          items: { include: { product: { include: { category: true } } } },
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: { order: createdOrder },
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid order id");
      error.statusCode = 400;
      throw error;
    }

    const { status } = req.body ?? {};
    const allowed = ["enquiry", "ordered", "processing", "dispatched", "delivered", "cancelled"];
    if (!status || !allowed.includes(String(status))) {
      const error = new Error(
        "status must be enquiry/ordered/processing/dispatched/delivered/cancelled",
      );
      error.statusCode = 400;
      throw error;
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: String(status) },
    });

    return res.json({
      success: true,
      message: "Order status updated successfully",
      data: { order },
    });
  } catch (error) {
    if (error?.code === "P2025") {
      error.statusCode = 404;
      error.message = "Order not found";
    }
    next(error);
  }
};

export const deleteOrderController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid order id");
      error.statusCode = 400;
      throw error;
    }

    const order = await prisma.order.update({
      where: { id },
      data: { isActive: false },
    });

    return res.json({
      success: true,
      message: "Order deleted successfully",
      data: { order },
    });
  } catch (error) {
    if (error?.code === "P2025") {
      error.statusCode = 404;
      error.message = "Order not found";
    }
    next(error);
  }
};
