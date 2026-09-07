import { test, expect } from '@playwright/test'

for (const route of ['/', '/components', '/docs/getting-started', '/docs/agents', '/blog']) {
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

test('Gemini context guide links to a usable component reference', async ({ page, request }) => {
  await page.goto('/docs/agents')
  await expect(page.getByRole('heading', { name: 'Gemini context', exact: true })).toBeVisible()
  const download = page.getByRole('link', { name: 'Download GEMINI.md', exact: true })
  await expect(download).toHaveAttribute('href', '/ai/GEMINI.md')
  const response = await request.get('/ai/GEMINI.md')
  expect(response.status()).toBe(200)
  const context = await response.text()
  expect(context).toContain('https://kit.n3wth.com/r/[name].json')
  expect(context).toContain('## Component Catalog')
})
