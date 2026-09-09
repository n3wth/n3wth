import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ['@n3wth/ui'],
  outputFileTracingRoot: path.join(__dirname, "../.."),
  turbopack: { root: path.join(__dirname, "../..") },
};

export default nextConfig;
