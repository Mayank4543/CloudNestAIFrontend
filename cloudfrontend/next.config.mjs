/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "ccb2c0c3c50894a1e4c33b453e025b3a.r2.cloudflarestorage.com",
      "localhost",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/api/files/proxy/**",
      },
    ],
  },
};

export default nextConfig;
