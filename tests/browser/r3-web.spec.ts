import { test, expect } from '@playwright/test'

test('light OS preference keeps the initial and hydrated canvas dark', async ({ browser, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'light' })
  const initial = await context.newPage()
  await initial.goto('http://127.0.0.1:4286/docs')
  const canvas = await initial.locator('html').evaluate(element => getComputedStyle(element).backgroundColor)
  await expect(initial.locator('html')).toHaveAttribute('data-theme', 'dark')
  expect(canvas).not.toBe('rgba(0, 0, 0, 0)')
  expect(canvas).not.toBe('rgb(255, 255, 255)')
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/docs')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('html')).toHaveCSS('background-color', canvas)
  await context.close()
})

test('new page clicks start at top and Back restores the prior position', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.scrollTo(0, 700))
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(700)
  const docs = page.getByRole('navigation', { name: 'Primary', exact: true }).getByRole('link', { name: 'Docs', exact: true })
  if (!await docs.isVisible()) await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  await docs.click()
  await expect(page).toHaveURL(/\/docs$/)
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(700)
})

test('mobile docs section links wrap in the document and navigate', async ({ page }) => {
  await page.goto('/docs/introduction')
  const sections = page.getByRole('navigation', { name: 'Documentation sections' })
  if ((page.viewportSize()?.width ?? 1440) >= 1024) {
    await expect(sections).toBeHidden()
    return
  }
  await expect(sections).toBeVisible()
  await expect(sections).not.toHaveCSS('position', 'sticky')
  await expect(sections.getByRole('link')).toHaveCount(7)
  await sections.getByRole('link', { name: 'Integrations', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/integrations$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('docs code is compact and footer links use one treatment', async ({ page }) => {
  await page.goto('/docs/integrations')
  const code = page.locator('main pre code').first()
  await expect(code).toHaveCSS('font-size', '13px')
  const links = page.locator('footer a')
  const treatments = await links.evaluateAll(elements => elements.map(element => {
    const style = getComputedStyle(element)
    return `${style.fontSize}|${style.fontWeight}|${style.color}`
  }))
  expect(treatments.length).toBeGreaterThan(1)
  expect(new Set(treatments).size).toBe(1)
})

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

test('integration guide documents Antigravity MCP configuration', async ({ page }) => {
  await page.goto('/docs/integrations')
  await expect(page.getByRole('heading', { name: 'Connect Antigravity CLI', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Antigravity CLI MCP documentation', exact: true })).toHaveAttribute('href', 'https://antigravity.google/docs/cli/mcp/')
  await expect(page.locator('main')).toContainText('mcpServers')
})
