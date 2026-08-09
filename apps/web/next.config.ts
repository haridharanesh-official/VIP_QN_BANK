import { resolve } from "node:path";
import type { NextConfig } from "next";

try { process.loadEnvFile(resolve(process.cwd(), "../../.env")); }
catch { /* Deployment environments provide variables directly. */ }

const nextConfig: NextConfig = {
  transpilePackages: ["@edugen/shared"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.API_URL || "http://localhost:4000"}/api/v1/:path*`,
      },
    ];
  },
};
export default nextConfig;
