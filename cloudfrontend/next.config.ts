import type { NextConfig } from "next";
import dotenv from "dotenv";

dotenv.config(); // Loads .env.local

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Any other config...
};

export default nextConfig;
