import { defineConfig } from '@playwright/test'

const allWorkspaces = [
  '@n3wth/portfolio',
  '@n3wth/ui-docs',
  '@n3wth/garden',
  '@n3wth/kit',
  '@n3wth/r3-web',
]
const affected: string[] = process.env.AFFECTED_WORKSPACES
  ? JSON.parse(process.env.AFFECTED_WORKSPACES)
  : allWorkspaces
const apps = [
  { name: 'portfolio', workspace: '@n3wth/portfolio', port: 4281, testMatch: 'browser/portfolio.spec.ts', command: 'vite' },
  { name: 'ui-docs', workspace: '@n3wth/ui-docs', port: 4282, testMatch: 'browser/ui-docs.spec.ts', command: 'vite' },
  { name: 'garden', workspace: '@n3wth/garden', port: 4284, testMatch: 'garden/routes.spec.ts', command: 'next' },
  { name: 'kit', workspace: '@n3wth/kit', port: 4285, testMatch: 'browser/kit.spec.ts', command: 'next' },
  { name: 'r3-web', workspace: '@n3wth/r3-web', port: 4286, testMatch: 'browser/r3-web.spec.ts', command: 'next' },
].filter(app => affected.includes(app.workspace))

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 2,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { browserName: 'chromium', contextOptions: { reducedMotion: 'reduce' }, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: apps.flatMap(app => [390, 852, 1440].map(width => ({
    name: `${app.name}-${width}`,
    testMatch: app.testMatch,
    use: { baseURL: `http://127.0.0.1:${app.port}`, viewport: { width, height: 900 } },
  }))),
  webServer: apps.map(app => ({
    command: app.command === 'next'
      ? `npm run start --workspace ${app.workspace} -- --hostname 127.0.0.1 --port ${app.port}`
      : `npm exec --workspace ${app.workspace} -- vite preview --host 127.0.0.1 --port ${app.port} --strictPort`,
    url: `http://127.0.0.1:${app.port}`,
    reuseExistingServer: false,
    timeout: 30_000,
  })),
})
