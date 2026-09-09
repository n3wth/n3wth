import { test, expect } from '@playwright/test'
import { expectSiteFoundation } from './site-foundation'

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
