import { test, expect } from '@playwright/test'

test('note listing and nested note remain readable', async ({ page }, testInfo) => {
  for (const route of ['/notes', '/frameworks/5-whys']) {
    const response = await page.goto(route)
    expect(response?.ok()).toBe(true)
    await expect(page.locator('main h1').first()).toBeVisible()
    await expect(page.locator('main')).toContainText(route === '/notes' ? 'Every plant' : '5 Whys')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(route === '/notes' ? 'notes.png' : 'note.png') })
  }
})

test('discovery feeds and note OG assets remain available', async ({ request }) => {
  for (const [route, type] of [
    ['/feed.xml', 'application/rss+xml'], ['/sitemap.xml', 'application/xml'],
    ['/robots.txt', 'text/plain'], ['/llms.txt', 'text/plain'], ['/og/frameworks/5-whys', 'image/png'],
  ]) {
    const response = await request.get(route)
    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain(type)
  }
})
