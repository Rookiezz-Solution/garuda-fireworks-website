import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCustomersController = async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { isActive: true },
      orderBy: { id: "desc" },
    });

    return res.json({
      success: true,
      message: "Customers fetched successfully",
      data: { customers },
    });
  } catch (error) {
    next(error);
  }
};
//er
export const getCustomerByIdController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid customer id");
      error.statusCode = 400;
      throw error;
    }

    const customer = await prisma.customer.findFirst({
      where: { id, isActive: true },
    });

    if (!customer) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      throw error;
    }

    return res.json({
      success: true,
      message: "Customer fetched successfully",
      data: { customer },
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomerController = async (req, res, next) => {
  try {
    const { name, phone, email, deliveryAddress } = req.body ?? {};
    if (!name || !phone) {
      const error = new Error("name and phone are required");
      error.statusCode = 400;
      throw error;
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email: email ?? null,
        deliveryAddress: deliveryAddress ?? null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: { customer },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      error.statusCode = 400;
      error.message = "Customer phone already exists";
    }
    next(error);
  }
};

export const updateCustomerController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid customer id");
      error.statusCode = 400;
      throw error;
    }

    const { name, phone, email, deliveryAddress, isActive } = req.body ?? {};
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: name === undefined ? undefined : name,
        phone: phone === undefined ? undefined : phone,
        email: email === undefined ? undefined : email,
        deliveryAddress: deliveryAddress === undefined ? undefined : deliveryAddress,
        isActive: isActive === undefined ? undefined : Boolean(isActive),
      },
    });

    return res.json({
      success: true,
      message: "Customer updated successfully",
      data: { customer },
    });
  } catch (error) {
    if (error?.code === "P2025") {
      error.statusCode = 404;
      error.message = "Customer not found";
    }
    if (error?.code === "P2002") {
      error.statusCode = 400;
      error.message = "Customer phone already exists";
    }
    next(error);
  }
};

export const deleteCustomerController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid customer id");
      error.statusCode = 400;
      throw error;
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });

    return res.json({
      success: true,
      message: "Customer deleted successfully",
      data: { customer },
    });
  } catch (error) {
    if (error?.code === "P2025") {
      error.statusCode = 404;
      error.message = "Customer not found";
    }
    next(error);
  }
};
