import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'r3-web.spec.ts',
  timeout: 30_000,
  workers: 2,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4286',
    contextOptions: { reducedMotion: 'reduce' },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [390, 852, 1440].map(width => ({
    name: `r3-web-${width}`,
    use: { viewport: { width, height: 900 } },
  })),
  webServer: {
    command: 'npm run start -w @n3wth/r3-web -- --hostname 127.0.0.1 --port 4286',
    url: 'http://127.0.0.1:4286',
    reuseExistingServer: false,
  },
})
