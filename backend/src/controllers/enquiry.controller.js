import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createEnquiryController = async (req, res, next) => {
  try {
    const { name, email, phone, message, eventDate, budget } = req.body ?? {};
    if (!name || !phone || !message) {
      const error = new Error("name, phone and message are required");
      error.statusCode = 400;
      throw error;
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        name,
        email: email ?? null,
        phone,
        message,
        eventDate: eventDate ? new Date(eventDate) : null,
        budget: budget ?? null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: { enquiry },
    });
  } catch (error) {
    next(error);
  }
};

export const getEnquiriesController = async (req, res, next) => {
  try {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdOn: "desc" },
    });

    return res.json({
      success: true,
      message: "Enquiries fetched successfully",
      data: { enquiries },
    });
  } catch (error) {
    next(error);
  }
};

export const getEnquiryByIdController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid enquiry id");
      error.statusCode = 400;
      throw error;
    }

    const enquiry = await prisma.enquiry.findFirst({ where: { id } });
    if (!enquiry) {
      const error = new Error("Enquiry not found");
      error.statusCode = 404;
      throw error;
    }

    return res.json({
      success: true,
      message: "Enquiry fetched successfully",
      data: { enquiry },
    });
  } catch (error) {
    next(error);
  }
};

export const updateEnquiryStatusController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const error = new Error("Invalid enquiry id");
      error.statusCode = 400;
      throw error;
    }

    const { status } = req.body ?? {};
    const allowed = ["pending", "reviewed", "closed"];
    if (!status || !allowed.includes(status)) {
      const error = new Error("status must be pending/reviewed/closed");
      error.statusCode = 400;
      throw error;
    }

    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: { status },
    });

    return res.json({
      success: true,
      message: "Enquiry status updated successfully",
      data: { enquiry },
    });
  } catch (error) {
    if (error?.code === "P2025") {
      error.statusCode = 404;
      error.message = "Enquiry not found";
    }
    next(error);
  }
};
