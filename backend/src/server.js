import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import imageRoutes from "./routes/image.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import orderRoutes from "./routes/order.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.get("/api/health", (req, res) => {
  return res.json({ success: true, message: "Server is running", data: {} });
});

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  return res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorMiddleware);

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
