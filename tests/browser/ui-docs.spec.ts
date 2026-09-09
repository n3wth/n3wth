import { test, expect } from '@playwright/test'
import { expectSiteFoundation } from './site-foundation'

test('showcase spacing, icon layout and example controls survive both themes', async ({ page }) => {
  await page.goto('/components')
  for (const theme of ['light', 'dark']) {
    const switchTheme = page.getByRole('button', { name: `Switch to ${theme} mode`, exact: true }).first()
    if (await switchTheme.count()) await switchTheme.click()
    const footerColors = await page.locator('.n3wth-site-footer a').evaluateAll(links => links.map(link => getComputedStyle(link).color))
    expect(new Set(footerColors).size).toBe(1)
    await expect(page.locator('#hooks pre code').first()).toHaveCSS('font-size', '13px')
    const heading = page.getByRole('heading', { name: 'useCountUp', exact: true })
    await heading.scrollIntoViewIfNeeded()
    if ((page.viewportSize()?.width ?? 1440) < 1024) {
      const sections = page.getByRole('navigation', { name: 'Component sections', exact: true }).filter({ visible: true })
      await expect(sections.locator('[aria-current]')).toHaveCount(0)
      expect(await sections.evaluate(element => element.getBoundingClientRect().bottom)).toBeLessThan(0)
    }
    const gaps = await heading.evaluate(element => {
      const demo = element.parentElement!.nextElementSibling!
      const code = demo.nextElementSibling!
      return [demo.getBoundingClientRect().top - element.getBoundingClientRect().bottom,
        code.getBoundingClientRect().top - demo.getBoundingClientRect().bottom]
    })
    expect(gaps).toEqual([16, 16])
    const countDemo = heading.locator('../..')
    await countDemo.getByRole('button', { name: 'Replay', exact: true }).click()
    await expect(countDemo.locator('.tabular-nums')).toHaveText('1000')
    const buttonDemo = page.getByRole('heading', { name: 'Button', exact: true }).locator('../..')
    const ghost = buttonDemo.getByRole('button', { name: 'ghost', exact: true })
    await ghost.click()
    await expect(ghost).toHaveAttribute('aria-pressed', 'true')
    expect((await ghost.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    const iconButton = buttonDemo.getByRole('button', { name: 'With Icon', exact: true })
    const icon = await iconButton.locator('svg').boundingBox()
    const label = await iconButton.getByText('With Icon', { exact: true }).boundingBox()
    expect(icon!.x + icon!.width).toBeLessThan(label!.x)
    expect(Math.abs(icon!.y + icon!.height / 2 - label!.y - label!.height / 2)).toBeLessThan(2)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
})

test('mobile documentation uses direct links without a second sticky header', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1440) >= 1024, 'Desktop uses the persistent sidebar')
  await page.goto('/docs/getting-started')
  const theming = page.getByRole('navigation', { name: 'Documentation', exact: true }).getByRole('link', { name: 'Theming', exact: true }).filter({ visible: true })
  await theming.focus()
  await theming.click()
  await expect(page).toHaveURL(/\/docs\/theming$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Theming')
  await expect(page.getByRole('button', { name: /^Documentation:/ })).toHaveCount(0)
})

test('system guide loads the shared theme and font assets', async ({ page }) => {
  await page.goto('/')
  await expectSiteFoundation(page)
})

test('system ownership, native primitive and documentation navigation work', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const response = await page.goto('/')
  expect(response?.ok()).toBe(true)
  await expect(page.locator('body')).not.toHaveText('')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('n3wth/ui design system')
  for (const name of ['Sites', '@n3wth/ui', 'Astryx']) {
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
  }
  await expect(page.getByRole('link', { name: 'Astryx', exact: true })).toHaveAttribute('href', 'https://github.com/facebook/astryx')
  await page.locator('section[aria-labelledby="architecture"]').screenshot({ path: testInfo.outputPath('architecture.png') })
  await page.getByRole('button', { name: 'Try the primitive' }).click()
  await expect(page.getByRole('status', { name: 'Primitive activation' })).toHaveText('Activated 1 time')
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)
  const screenshot = testInfo.outputPath('ui-system.png')
  await page.screenshot({ path: screenshot })
  await testInfo.attach('ui-system', { path: screenshot, contentType: 'image/png' })
  const docs = page.getByRole('navigation', { name: 'Primary', exact: true }).getByRole('link', { name: 'Docs', exact: true })
  if (!await docs.isVisible()) await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  await docs.click()
  await expect(page).toHaveURL(/\/docs\/getting-started$/)
  await expect(page.locator('h1').first()).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Getting Started')
  await page.goto('/components')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Component examples')
  await expect(page.getByText('Existing UI APIs stay available through the compatibility layer.', { exact: false })).toBeVisible()
  const field = page.locator('.n3wth-visual-field').first()
  await expect(field).toHaveCSS('height', '220px')
  await expect(field.locator('.n3wth-visual-dot').first()).toHaveCSS('opacity', '0.6')
  expect(errors).toEqual([])
})
