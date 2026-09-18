import path from "node:path";
import type { NextConfig } from "next";
import { withAxiom } from "next-axiom";

const nextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  turbopack: { root: path.resolve(__dirname, '../..') },
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
