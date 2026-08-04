import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

try { process.loadEnvFile(resolve(process.cwd(), "../../.env")); } catch { /* Deployment environments provide variables directly. */ }

const runtimeUrl = process.env.DATABASE_URL?.trim();
if (!runtimeUrl) throw new Error("DATABASE_URL is required.");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: { url: process.env.DIRECT_URL?.trim() || runtimeUrl },
});
