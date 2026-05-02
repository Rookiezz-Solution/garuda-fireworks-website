import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

dotenv.config();

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
