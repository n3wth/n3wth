import { defineConfig } from '@playwright/test'

const previewUrl = process.env.SKILLS_PREVIEW_URL

export default defineConfig({
  testDir: './e2e',
  testMatch: 'migration.spec.ts',
  workers: 2,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: previewUrl || 'http://127.0.0.1:4391',
    storageState: process.env.SKILLS_BROWSER_STORAGE_STATE,
    contextOptions: { reducedMotion: 'reduce' },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [390, 852, 1440].map(width => ({
    name: `skills-${width}`,
    use: { browserName: 'chromium' as const, viewport: { width, height: 900 } },
  })),
  webServer: previewUrl ? undefined : {
    command: 'npm run start -- --hostname 127.0.0.1 --port 4391',
    url: 'http://127.0.0.1:4391',
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
