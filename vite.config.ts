import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
          // Lenis for smooth scroll
          if (id.includes('lenis')) {
            return 'lenis'
          }
        },
      },
    },
    // Increase limit since GSAP is large but necessary
    chunkSizeWarningLimit: 600,
  },
})
