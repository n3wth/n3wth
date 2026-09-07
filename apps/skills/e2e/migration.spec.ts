import { test, expect } from '@playwright/test'

for (const route of ['/', '/skill/mcp-builder', '/about', '/bundles']) {
  test(`${route} renders from the production build`, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    const response = await page.goto(route)
    expect(response?.ok()).toBe(true)
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.locator('nav').first()).toBeVisible()
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
  await expect(command).toContainText('bash -s -- all ')
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
