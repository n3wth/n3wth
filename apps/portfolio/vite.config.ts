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
          // Scroll plugins ride with the lazy pieces that use them
          // (src/lib/scroll.ts), not the eager gsap chunk below —
          // ScrollTrigger pulls in Observer, so it goes here too.
          if (id.includes('gsap') && /ScrollTrigger|ScrollToPlugin|SplitText|Observer/.test(id)) {
            return 'gsap-scroll'
          }
          // GSAP core in one chunk (loaded together, cached together)
          if (id.includes('gsap') || id.includes('@gsap/react')) {
            return 'gsap'
          }
          // React vendor bundle. Path-segment matches only: a bare
          // id.includes('react') also caught @react-three/fiber, drei, and
          // postprocessing, dragging all of three.js into this eagerly
          // preloaded chunk on every route.
          if (
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/scheduler/')
          ) {
            return 'vendor'
          }
        },
      },
    },
    // Increase limit since GSAP is large but necessary
    chunkSizeWarningLimit: 600,
  },
}))
