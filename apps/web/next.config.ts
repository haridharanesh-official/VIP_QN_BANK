import { resolve } from "node:path";
import type { NextConfig } from "next";

try { process.loadEnvFile(resolve(process.cwd(), "../../.env")); }
catch { /* Deployment environments provide variables directly. */ }

const nextConfig: NextConfig = {};
export default nextConfig;
