import { test, expect } from '@playwright/test'

for (const route of ['/', '/components', '/docs/getting-started', '/blog']) {
  test(`Kit renders ${route}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    const response = await page.goto(route)
    expect(response?.ok()).toBe(true)
    await expect(page.locator('h1').first()).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
    expect(errors).toEqual([])
  })
}

test('registry remains downloadable', async ({ request }) => {
  const response = await request.get('/r/button.json')
  expect(response.ok()).toBe(true)
  expect((await response.json()).name).toBe('button')
})
