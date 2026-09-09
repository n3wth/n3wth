import { test, expect } from '@playwright/test'

test('article calendar date stays stable across browser timezones', async ({ browser }) => {
  for (const timezoneId of ['America/Los_Angeles', 'Asia/Tokyo']) {
    const context = await browser.newContext({ timezoneId })
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('http://127.0.0.1:4284/astryx-vs-shadcn-vs-angular-material')
    await expect(page.locator('time[datetime="2026-07-14T00:00:00.000Z"]')).toHaveText('Jul 14, 2026')
    await page.getByRole('button', { name: 'Search notes' }).click()
    expect(errors).toEqual([])
    await context.close()
  }
})

test('note listing and nested note remain readable', async ({ page }, testInfo) => {
  for (const route of ['/', '/notes', '/frameworks/5-whys']) {
    const response = await page.goto(route)
    expect(response?.ok()).toBe(true)
    await expect(page.locator('main h1').first()).toBeVisible()
    await expect(page.locator('main')).toContainText(route === '/' ? 'A garden of growing ideas' : route === '/notes' ? 'Every plant' : '5 Whys')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
    const nav = await page.locator('.n3wth-site-navigation-island').boundingBox()
    expect(nav).not.toBeNull()
    expect(nav!.x).toBeGreaterThanOrEqual(0)
    expect(nav!.x + nav!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
    if (route === '/') {
      const heading = await page.locator('main h1').first().boundingBox()
      expect(heading!.y).toBeGreaterThanOrEqual(nav!.y + nav!.height)
    }
    for (const control of await page.locator('.n3wth-site-navigation-island a:visible, .n3wth-site-navigation-island button:visible').all()) {
      const bounds = await control.boundingBox()
      expect(bounds).not.toBeNull()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
    }
    await page.screenshot({ path: testInfo.outputPath(route === '/' ? 'home.png' : route === '/notes' ? 'notes.png' : 'note.png') })
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
