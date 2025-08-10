import type { NextConfig } from "next";
import dotenv from "dotenv";

dotenv.config(); // Loads .env.local

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com"], // <-- yeh add kiya
  },
  // Any other config...
};

export default nextConfig;
