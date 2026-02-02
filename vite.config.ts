import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split GSAP into its own chunk for better caching
          gsap: ['gsap', '@gsap/react', 'gsap/ScrollTrigger', 'gsap/SplitText'],
          // Split React vendor bundle
          vendor: ['react', 'react-dom'],
          // Split Lenis for smooth scroll
          lenis: ['lenis'],
        },
      },
    },
    // Increase limit since GSAP is large but necessary
    chunkSizeWarningLimit: 600,
  },
})
