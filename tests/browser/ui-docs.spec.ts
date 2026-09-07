import { test, expect } from '@playwright/test'

test('component documentation renders with usable navigation', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const response = await page.goto('/')
  expect(response?.ok()).toBe(true)
  await expect(page.locator('body')).not.toHaveText('')
  await expect(page.locator('h1').first()).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)
  const screenshot = testInfo.outputPath('ui-components.png')
  await page.screenshot({ path: screenshot })
  await testInfo.attach('ui-components', { path: screenshot, contentType: 'image/png' })
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Docs', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/getting-started$/)
  await expect(page.locator('h1').first()).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)
  expect(errors).toEqual([])
})
