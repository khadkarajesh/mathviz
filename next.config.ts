import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone build for efficient Vercel deployment
  output: 'standalone',
  // Compress responses
  compress: true,
  // Image optimization (no external domains needed yet)
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
