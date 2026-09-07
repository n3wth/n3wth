import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/garden',
  timeout: 30_000,
  workers: 2,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4284', browserName: 'chromium', reducedMotion: 'reduce', screenshot: 'only-on-failure' },
  projects: [390, 1440].map(width => ({ name: `garden-${width}`, use: { viewport: { width, height: 900 } } })),
  webServer: { command: 'npm run start -w @n3wth/garden -- --port 4284', url: 'http://127.0.0.1:4284', reuseExistingServer: false },
})
