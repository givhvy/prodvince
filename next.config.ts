import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dtkmkk6k7/image/upload/**",
      },
    ],
  },
};

export default nextConfig;
