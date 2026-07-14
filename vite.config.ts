import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const jsxDevRuntimeShim = fileURLToPath(
  new URL('./src/lib/jsx-dev-runtime-shim.js', import.meta.url)
)

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias:
      command === 'build'
        ? [
            // @astryxdesign/core 0.1.5 dist requires react/jsx-dev-runtime,
            // which React 19 stubs out (jsxDEV = undefined) in production
            // builds. Alias it to a local shim for build only — dev keeps
            // the real dev runtime for fast refresh / better errors.
            { find: 'react/jsx-dev-runtime', replacement: jsxDevRuntimeShim },
          ]
        : [],
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // GSAP and its plugins in one chunk (loaded together, cached together)
          if (id.includes('gsap') || id.includes('@gsap/react')) {
            return 'gsap'
          }
          // React vendor bundle
          if (id.includes('react-dom') || (id.includes('react') && !id.includes('react-router'))) {
            return 'vendor'
          }
        },
      },
    },
    // Increase limit since GSAP is large but necessary
    chunkSizeWarningLimit: 600,
  },
}))
