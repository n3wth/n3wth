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

test('compact docs menu supports keyboard access and closes after navigation', async ({ page }) => {
  await page.goto('/docs/introduction')
  const toggle = page.getByRole('button', { name: 'Open documentation menu', exact: true })
  const all = page.getByRole('navigation', { name: 'Documentation', exact: true })
  await expect(page.getByRole('link', { name: 'n3wth home', exact: true })).toHaveAttribute('href', 'https://n3wth.com')
  await expect(page.getByRole('link', { name: 'r3 home', exact: true })).toHaveAttribute('href', '/')
  await expect(page.getByRole('link', { name: 'Documentation home', exact: true })).toHaveAttribute('href', '/docs')
  if ((page.viewportSize()?.width ?? 1440) >= 1024) {
    await expect(toggle).toBeHidden()
    return
  }
  await expect(all).toBeHidden()
  await toggle.focus()
  await toggle.press('Enter')
  await expect(all).toBeVisible()
  await expect(all.getByRole('link', { name: 'Introduction', exact: true })).toBeFocused()
  await expect(all.getByRole('link', { name: 'Introduction', exact: true })).toHaveAttribute('aria-current', 'page')
  await all.locator('a[href="/docs/integrations"]').click()
  await expect(page).toHaveURL(/\/docs\/integrations$/)
  await expect(all).toBeHidden()
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('docs navigation discloses its state on every viewport', async ({ page }) => {
  await page.goto('/docs/introduction')
  if ((page.viewportSize()?.width ?? 1440) >= 1024) {
    const toggle = page.getByRole('button', { name: 'API Reference', exact: true })
    const initial = await toggle.getAttribute('aria-expanded')
    expect(['true', 'false']).toContain(initial)
    await toggle.click()
    await expect(toggle).not.toHaveAttribute('aria-expanded', initial!)
    await expect(
      page.getByRole('link', { name: 'Introduction', exact: true }).first()
    ).toHaveAttribute('aria-current', 'page')
  } else {
    await page.getByRole('button', { name: 'Open documentation menu', exact: true }).click()
    const all = page.getByRole('navigation', { name: 'Documentation', exact: true })
    await expect(all).toBeVisible()
    await all.getByRole('link', { name: 'Troubleshooting', exact: true }).click()
    await expect(page).toHaveURL(/\/docs\/troubleshooting$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  }
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
  for (const path of ['/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt', '/docs-index.json', '/mcp-tools.json', '/docs-markdown/api-reference', '/opengraph-image']) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(200)
    expect((await response.body()).length).toBeGreaterThan(0)
  }
})

test('long code wraps with room for copy controls and preserves copied content', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/docs/ai-intelligence')
  const blocks = page.locator('main pre')
  expect(await blocks.count()).toBeGreaterThan(0)
  const geometry = await blocks.evaluateAll(elements => elements.map(element => {
    const code = element.querySelector('code')!
    const button = element.querySelector('button')!
    const rect = element.getBoundingClientRect()
    return { overflow: code.scrollWidth > code.clientWidth + 1, whiteSpace: getComputedStyle(code).whiteSpace, inset: rect.right - button.getBoundingClientRect().right }
  }))
  for (const block of geometry) {
    expect(block.overflow).toBe(false)
    expect(block.whiteSpace).toBe('pre-wrap')
    expect(block.inset).toBeGreaterThanOrEqual(12)
  }
  const original = await blocks.first().locator('code').textContent()
  await blocks.first().getByRole('button', { name: 'Copy code' }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(original)
})

test('page copy returns Markdown and schema and changelog links work', async ({ page, request, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/docs/api-reference')
  await page.getByRole('button', { name: 'Copy page', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Page copied as Markdown.' })).toBeVisible()
  const markdown = await (await request.get('/docs-markdown/api-reference')).text()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(markdown)
  await expect(page.getByRole('link', { name: 'MCP tool schemas (JSON)' })).toHaveAttribute('href', '/mcp-tools.json')
  expect((await (await request.get('/mcp-tools.json')).json()).tools).toHaveLength(14)
  await page.goto('/docs/changelog')
  await expect(page.getByRole('heading', { level: 1, name: 'Changelog' })).toBeVisible()
  await expect(page.locator('main')).toContainText('September 1, 2026')
  expect((await request.get('/docs-markdown/not-a-page')).status()).toBe(404)
})

test('search finds body text, returns cited answers and preserves results on AI failure', async ({ page }) => {
  await page.route('https://r3-docs-search.newth.workers.dev/ask', route => route.fulfill({
    contentType: 'application/json', body: JSON.stringify({ answer: 'Duplicates use Jaccard similarity. [1]', sources: [{ id: '1', title: 'API Reference', heading: 'deduplicate_memories', href: '/docs/api-reference' }] }),
  }))
  await page.goto('/docs')
  await page.locator('header').getByRole('button', { name: 'Search docs', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Search docs' })
  await expect(dialog).toBeVisible()
  const input = dialog.getByRole('textbox', { name: 'Search or ask a question' })
  await expect(input).toBeFocused()
  await input.fill('Jaccard similarity')
  await expect(dialog.getByRole('link').first()).toContainText('deduplicate_memories')
  await dialog.getByRole('button', { name: 'Ask AI' }).click()
  await expect(dialog.getByRole('region', { name: 'AI answer' })).toContainText('Duplicates use Jaccard similarity.')
  await expect(dialog.getByRole('link', { name: '[1] API Reference · deduplicate_memories' })).toHaveAttribute('href', '/docs/api-reference')
  await page.unroute('https://r3-docs-search.newth.workers.dev/ask')
  await page.route('https://r3-docs-search.newth.workers.dev/ask', route => route.fulfill({ status: 503, body: '{}' }))
  await input.fill('search_memory')
  await dialog.getByRole('button', { name: 'Ask AI' }).click()
  await expect(dialog.getByRole('alert')).toContainText('AI answers are unavailable')
  await expect(dialog.getByRole('link').first()).toContainText('search_memory')
  await input.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page.locator('header').getByRole('button', { name: 'Search docs', exact: true })).toBeFocused()
})

test('integration guide documents Antigravity MCP configuration', async ({ page }) => {
  await page.goto('/docs/integrations')
  await expect(page.getByRole('heading', { name: 'Connect Antigravity CLI', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Antigravity CLI MCP documentation', exact: true })).toHaveAttribute('href', 'https://antigravity.google/docs/cli/mcp/')
  await expect(page.locator('main')).toContainText('mcpServers')
})
