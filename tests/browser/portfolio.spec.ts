import { test, expect } from '@playwright/test'
import { expectSiteFoundation } from './site-foundation'

test('public navigation clears article and utility metadata', async ({ page }) => {
  for (const initial of ['/error', '/thinking/gtd-mini']) {
    await page.goto(initial)
    const toggle = page.locator('.n3wth-site-navigation-toggle')
    if (await toggle.isVisible()) await toggle.click()
    await page.locator('.n3wth-site-navigation-links').getByRole('link', { name: 'Work', exact: true }).click()
    await expect(page).toHaveTitle('Work — Oliver Newth')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://n3wth.com/work')
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website')
    await expect(page.locator('meta[property="article:published_time"]')).toHaveCount(0)
    const articleCount = await page.locator('script[type="application/ld+json"]').evaluateAll(elements => elements.flatMap(element => {
      const schema = JSON.parse(element.textContent || '{}')
      return Array.isArray(schema) ? schema : [schema]
    }).filter(schema => schema['@type'] === 'Article').length)
    expect(articleCount).toBe(0)
  }
})

test('site identity is present in initial HTML and rendered routes', async ({ page, request }) => {
  const response = await request.get('/')
  expect(await response.text()).toContain('"@type": "WebSite"')
  for (const route of ['/', '/work', '/']) {
    await page.goto(route)
    const websites = await page.locator('script[type="application/ld+json"]').evaluateAll(elements => elements.map(element => JSON.parse(element.textContent || '{}')).filter(schema => schema['@type'] === 'WebSite'))
    expect(websites).toHaveLength(1)
    expect(websites[0]).toMatchObject({ name: 'Oliver Newth', alternateName: 'n3wth.com', url: 'https://n3wth.com/' })
  }
  await expect(page.getByText('I build new ways to work with AI.', { exact: true })).toHaveAttribute('data-nosnippet', 'true')
})

test('diagrams are immediately visible with normal motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  for (const route of ['/thinking/gtd-mini', '/library']) {
    await page.goto(route)
    const nodes = page.locator('.kit-node-in')
    await expect(nodes.first()).toBeAttached()
    for (const node of await nodes.all()) await expect(node).toHaveCSS('opacity', '1')
    for (const line of await page.locator('.kit-line-draw').all()) {
      await expect(line).toHaveCSS('stroke-dashoffset', '0px')
    }
  }
})

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`shared visual bands remain visible with ${reducedMotion} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion })
    for (const route of ['/library', '/work', '/thinking', '/contact']) {
      await page.goto(route)
      const band = page.locator('.n3wth-visual-band').first()
      await expect(band).toBeAttached()
      await band.scrollIntoViewIfNeeded()
      await expect(band).toBeVisible()
      await expect(band).toHaveAttribute('aria-hidden', 'true')
      await expect.poll(() => band.evaluate(element => {
        const marks = [...element.querySelectorAll('.n3wth-visual-dot, .n3wth-visual-light-path')]
        return marks.length > 0 && marks.every(mark => {
          const style = getComputedStyle(mark)
          return Number(style.opacity) > 0 && style.visibility !== 'hidden'
            && (!mark.classList.contains('n3wth-visual-light-path') || Number.parseFloat(style.strokeDashoffset) === 0)
        })
      })).toBe(true)
      expect(await band.locator('[data-reveal]').count()).toBe(0)
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
    }
  })
}

test('work uses the shared theme and a usable resume action', async ({ page }) => {
  await page.goto('/work')
  await expectSiteFoundation(page)
  await expect(page.getByRole('link', { name: 'Resume (PDF)', exact: true })).toHaveAttribute('href', 'https://r2.n3wth.com/resume/oliver-newth-resume.pdf')
})

for (const route of ['/', '/work', '/art', '/thinking', '/library', '/contact']) {
  test(`${route} renders without runtime errors or horizontal overflow`, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    const response = await page.goto(route)
    expect(response?.ok()).toBe(true)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('header').first()).toBeVisible()
    if (route !== '/') await expect(page.locator('h1').first()).toBeVisible()
    if (route === '/') {
      test.setTimeout(60_000)
      await expect(page.locator('.night-field-stage.is-settled')).toBeVisible({ timeout: 45_000 })
      await expect(page.locator('.night-field-loader')).toHaveAttribute('data-ready', 'true')
      for (const name of ['Art', 'Work', 'Thinking', 'Contact', 'Garden', 'Pink Triangle']) {
        const label = page.locator(`.world-portal-link[aria-label="${name}"]`)
        await expect(label).toBeVisible()
      }
      const work = page.locator('.world-portal-link[aria-label="Work"]')
      await work.click({ trial: true })
      const screenshot = testInfo.outputPath('portfolio-home.png')
      await page.screenshot({ path: screenshot })
      await testInfo.attach('portfolio-home', { path: screenshot, contentType: 'image/png' })
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)
    expect(errors).toEqual([])
  })
}

test('primary navigation opens Work', async ({ page }) => {
  await page.goto('/art')
  const work = page.locator('#primary-navigation').getByRole('link', { name: 'Work', exact: true })
  // Compact navigation exposes the same links through its menu toggle.
  if (!await work.isVisible()) {
    await page.getByRole('button', { name: 'Primary', exact: true }).click()
  }
  await work.click()
  await expect(page).toHaveURL(/\/work$/)
  await expect(page.locator('h1').first()).toBeVisible()
})
