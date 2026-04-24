import "reflect-metadata";
import { DataSource } from "typeorm";

const isProduction = process.env.NODE_ENV === "production";

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: ["src/**/*.entity.ts", "dist/**/*.entity.js"],
  migrations: ["src/migrations/*.ts", "dist/migrations/*.js"],
  synchronize: false,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});
