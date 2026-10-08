import { defineConfig } from '@playwright/test'

const affected: string[] | undefined = process.env.AFFECTED_WORKSPACES
  ? JSON.parse(process.env.AFFECTED_WORKSPACES)
  : undefined
const apps = [
  { name: 'portfolio', workspace: '@n3wth/portfolio', port: 4281, testMatch: 'browser/portfolio.spec.ts', command: 'astro' },
  { name: 'ui-docs', workspace: '@n3wth/ui-docs', port: 4282, testMatch: 'browser/ui-docs.spec.ts', command: 'worker' },
  { name: 'garden', workspace: '@n3wth/garden', port: 4284, testMatch: 'garden/routes.spec.ts', command: 'worker' },
  { name: 'r3-web', workspace: '@n3wth/r3-web', port: 4286, testMatch: 'browser/r3-web.spec.ts', command: 'worker' },
].filter(app => !affected || affected.includes(app.workspace))

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
    command: app.command === 'worker'
        ? `npm run start --workspace ${app.workspace} -- --ip 127.0.0.1 --port ${app.port}`
        : `npm exec --workspace ${app.workspace} -- astro preview --ignore-lock --host 127.0.0.1 --port ${app.port}`,
    // Redirect destinations must not control local readiness.
    ...(app.name === 'r3-web' || app.name === 'ui-docs' ? { port: app.port } : { url: `http://127.0.0.1:${app.port}${app.name === 'garden' ? '/__health' : ''}` }),
    reuseExistingServer: false,
    timeout: 30_000,
  })),
})
