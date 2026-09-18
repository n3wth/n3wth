import path from "node:path";
import type { NextConfig } from "next";
import { withAxiom } from "next-axiom";

const nextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  turbopack: { root: path.resolve(__dirname, '../..') },
  // The note source and OG-card fonts are read with fs at runtime; without
  // explicit tracing they are missing from serverless and Worker bundles.
  outputFileTracingIncludes: {
    "/*": ["./content/**", "./src/lib/og-fonts/**"],
    "/**": ["./content/**", "./src/lib/og-fonts/**"],
  },
  async redirects() {
    return [
      {
        source: "/atomic-notess",
        destination: "/atomic-notes",
        permanent: true,
      },
    ];
  },
} satisfies NextConfig;

export default withAxiom(nextConfig);
