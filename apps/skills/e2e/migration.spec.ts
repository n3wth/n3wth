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
