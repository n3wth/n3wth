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

test('home offers a textual notes entry and the index can reset its filters', async ({ page }) => {
  await page.goto('/')
  const notes = page.getByRole('link', { name: 'Notes', exact: true })
  if (!await notes.isVisible()) {
    await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  }
  await notes.click()
  await expect(page).toHaveURL(/\/notes$/)
  await expect(page.getByRole('button', { name: 'Reset', exact: true })).toHaveCount(0)
  await page.getByPlaceholder(/Search \d+ notes/).fill('evergreen')
  const reset = page.getByRole('button', { name: 'Reset', exact: true })
  await expect(reset).toBeVisible()
  await reset.click()
  await expect(reset).toHaveCount(0)
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

test('comparison leads to the ownership guide', async ({ page, request }, testInfo) => {
  await page.goto('/astryx-vs-shadcn-vs-angular-material')
  await page.getByRole('link', { name: 'Choose UI component ownership', exact: true }).click()
  await expect(page).toHaveURL(/\/choose-ui-component-ownership$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Choose UI component ownership')
  await expect(page.getByRole('heading', { name: 'Assign fixes and checks', exact: true })).toBeAttached()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  await page.screenshot({ path: testInfo.outputPath('ownership.png') })
  await page.goBack()
  await expect(page).toHaveURL(/\/astryx-vs-shadcn-vs-angular-material$/)
  const sitemap = await request.get('/sitemap.xml')
  expect(await sitemap.text()).toContain('https://garden.n3wth.com/choose-ui-component-ownership')
})
