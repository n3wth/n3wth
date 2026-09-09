import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react()],
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
