import { test, expect } from '@playwright/test'

for (const path of ['/', '/docs', '/docs/getting-started/installation', '/docs/integrations']) {
  test(`${path} renders after direct navigation`, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1').first()).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath('page.png') })
    expect(errors).toEqual([])
  })
}

test('discovery endpoints and generated image remain available', async ({ request }) => {
  for (const path of ['/robots.txt', '/sitemap.xml', '/llms.txt', '/opengraph-image']) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(200)
    expect((await response.body()).length).toBeGreaterThan(0)
  }
})

test('integration guide documents Gemini MCP configuration', async ({ page }) => {
  await page.goto('/docs/integrations')
  await expect(page.getByRole('heading', { name: 'Connect Gemini CLI', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Gemini CLI MCP documentation', exact: true })).toHaveAttribute('href', 'https://geminicli.com/docs/tools/mcp-server/')
  await expect(page.locator('main')).toContainText('mcpServers')
})
