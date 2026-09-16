import { test, expect } from '@playwright/test'

test('catalog search and categories work without a sort control', async ({ page }) => {
  await page.goto('/')
  const catalog = page.getByRole('region', { name: 'Skill catalog' })
  await expect(page.getByRole('button', { name: /^Sort by:/ })).toHaveCount(0)
  await expect(page.getByText(/skills across \d+ categories/)).toHaveCount(0)
  const search = page.getByRole('textbox', { name: /Search skills by name/ })
  await search.fill('pdf')
  await expect(catalog.getByRole('heading', { name: 'PDF Toolkit', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Development', exact: true }).click()
  await expect(catalog.getByText('No skills match that yet')).toBeVisible()
  await page.getByRole('button', { name: 'Documents', exact: true }).click()
  await expect(catalog.getByRole('heading', { name: 'PDF Toolkit', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Clear search', exact: true }).click()
  await expect(search).toHaveValue('')
})

test('install command reports clipboard success and failure honestly', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async (text: string) => { if (!text.includes('bash -s -- gemini')) throw new Error('Wrong command') },
    } })
  })
  await page.getByRole('button', { name: 'Copy install command', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Command copied.' })).toHaveText('Command copied. Run it in your terminal to install.')
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async () => { throw new Error('Clipboard unavailable') },
    } })
  })
  await page.getByRole('button', { name: 'Copy install command', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Copy failed.' })).toHaveText('Copy failed. Select the command and copy it manually.')
})

for (const route of ['/', '/skill/pdf', '/about', '/bundles']) {
  test(`${route} renders from the production build`, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    const response = await page.goto(route)
    expect(response?.ok()).toBe(true)
    await expect(page.locator('h1').first()).toBeVisible()
    const toggle = page.locator('.n3wth-site-navigation-toggle')
    if (await toggle.isVisible()) await toggle.click()
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
    if (await toggle.isVisible()) await toggle.click()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
    if (route === '/') await page.screenshot({ path: testInfo.outputPath('skills-home.png') })
    expect(errors).toEqual([])
  })
}

test('callback without a code returns the existing auth error redirect', async ({ request }) => {
  const response = await request.get('/auth/callback', { maxRedirects: 0 })
  expect(response.status()).toBe(307)
  expect(response.headers().location).toMatch(/\/\?error=auth$/)
})

test('public installer remains available', async ({ request }) => {
  const response = await request.get('/install.sh')
  expect(response.ok()).toBe(true)
  expect(await response.text()).toContain('#!/bin/bash')
})

test('curated bundle command selects only available downloads', async ({ page }) => {
  await page.goto('/curated-bundles/frontend-starter')
  const command = page.locator('code').filter({ hasText: 'install.sh' }).first()
  await expect(command).toContainText('bash -s -- gemini ')
  await expect(command).not.toContainText('code-reviewer')
  await expect(page.getByText(/do not yet have downloads/)).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
})

test('fonts referenced by the shared UI stylesheet are available', async ({ request }) => {
  for (const file of ['MonaSans-Variable.woff2', 'MonaSans-Variable-Italic.woff2']) {
    const response = await request.get(`/fonts/${file}`)
    expect(response.ok()).toBe(true)
    expect((await response.body()).length).toBeGreaterThan(10_000)
  }
})

test('health route dispatches to its own handler', async ({ request }) => {
  const response = await request.get('/api/health/supabase')
  expect([200, 503]).toContain(response.status())
  const body = await response.json()
  expect(body).toHaveProperty('ok')
  expect(body).toHaveProperty('tables')
  expect(body.error).not.toBe('skillId required')
})
