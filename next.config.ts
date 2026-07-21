import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // API proxy is app/api/[...path]/route.ts (reads BACKEND_URL at runtime).
};

export default nextConfig;
