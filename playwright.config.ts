import { defineConfig } from '@playwright/test'

const affected: string[] = process.env.AFFECTED_WORKSPACES
  ? JSON.parse(process.env.AFFECTED_WORKSPACES)
  : ['@n3wth/portfolio', '@n3wth/ui-docs', '@n3wth/kit']
const apps = [
  { name: 'portfolio', workspace: '@n3wth/portfolio', port: 4281 },
  { name: 'ui-docs', workspace: '@n3wth/ui-docs', port: 4282 },
  { name: 'kit', workspace: '@n3wth/kit', port: 4285 },
].filter(app => affected.includes(app.workspace))

export default defineConfig({
  testDir: './tests/browser',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 2,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { browserName: 'chromium', reducedMotion: 'reduce', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: apps.flatMap(app => [390, 852, 1440].map(width => ({
    name: `${app.name}-${width}`,
    testMatch: `${app.name}.spec.ts`,
    use: { baseURL: `http://127.0.0.1:${app.port}`, viewport: { width, height: 900 } },
  }))),
  webServer: apps.map(app => ({
    command: app.name === 'kit'
      ? `npm run start --workspace ${app.workspace} -- --hostname 127.0.0.1 --port ${app.port}`
      : `npm exec --workspace ${app.workspace} -- vite preview --host 127.0.0.1 --port ${app.port} --strictPort`,
    url: `http://127.0.0.1:${app.port}`,
    reuseExistingServer: false,
    timeout: 30_000,
  })),
})
