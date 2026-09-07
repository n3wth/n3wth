import { test, expect } from '@playwright/test'

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
