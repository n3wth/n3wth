import path from "node:path";
import type { NextConfig } from "next";
import { withAxiom } from "next-axiom";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  // The OG-card fonts are read with fs at runtime; without explicit
  // tracing they were missing from serverless bundles in production
  // (ENOENT on every on-demand render of the catch-all route).
  outputFileTracingIncludes: {
    "/*": ["./src/lib/og-fonts/**"],
    "/**": ["./src/lib/og-fonts/**"],
  },
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    // Next's CSS loader prefixes package font URLs with './'. Resolve that
    // request back to the shared assets rather than copying fonts per app.
    config.resolve.alias["./@n3wth/ui/fonts"] = path.resolve(
      __dirname,
      "../../packages/ui/public/fonts"
    );
    return config;
  },
};

export default withAxiom(nextConfig);
