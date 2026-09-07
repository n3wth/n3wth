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
  // @astryxdesign/core 0.1.5 dist requires react/jsx-dev-runtime, whose
  // production build exports jsxDEV = undefined. Alias it to a shim backed by
  // the production jsx runtime (dev builds keep the real dev runtime).
  webpack: (config, { dev, webpack }) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    if (!dev) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^react\/jsx-dev-runtime$/,
          path.resolve(__dirname, "src/lib/jsx-dev-runtime-shim.js")
        )
      );
    }
    return config;
  },
};

export default withAxiom(nextConfig);
