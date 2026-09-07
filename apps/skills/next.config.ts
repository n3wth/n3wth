import type { NextConfig } from 'next'
import { withAxiom } from 'next-axiom'
import { fileURLToPath } from 'node:url'

const nextConfig = {
  // Transpile the declared @n3wth/ui package consistently in development and CI.
  transpilePackages: ['@n3wth/ui'],

  // Empty turbopack config to satisfy Next.js 16 (uses Turbopack by default)
  turbopack: { root: fileURLToPath(new URL('../..', import.meta.url)) },
  outputFileTracingRoot: fileURLToPath(new URL('../..', import.meta.url)),

  images: {
    unoptimized: true,
  },

  // Trailing slashes for cleaner URLs
  trailingSlash: false,

  // Enable React strict mode
  reactStrictMode: true,

  // Allow local network dev access
  allowedDevOrigins: ['http://192.168.1.212:3000'],
} satisfies NextConfig

export default withAxiom(nextConfig)
