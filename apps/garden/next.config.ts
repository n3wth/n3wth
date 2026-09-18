import path from "node:path";
import type { NextConfig } from "next";
import { withAxiom } from "next-axiom";

const nextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  turbopack: { root: path.resolve(__dirname, '../..') },
  // The OG-card fonts are read with fs at runtime; without explicit
  // tracing they were missing from serverless bundles in production
  // (ENOENT on every on-demand render of the catch-all route).
  outputFileTracingIncludes: {
    "/*": ["./src/lib/og-fonts/**"],
    "/**": ["./src/lib/og-fonts/**"],
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
