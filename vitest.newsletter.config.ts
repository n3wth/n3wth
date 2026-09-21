import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@/lib/site': fileURLToPath(new URL('./apps/garden/src/lib/site.ts', import.meta.url)) } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./apps/portfolio/src/test/setup.ts'],
    include: ['tests/newsletter-forms.test.tsx'],
  },
})
