import { expect, type Page } from '@playwright/test'

export async function expectSiteFoundation(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('data-astryx-theme', 'n3wth')
  const heading = page.locator('.n3wth-site-heading--page').first()
  await expect(heading).toBeVisible()
  await expect(heading).toHaveCSS('font-family', /Satoshi/)
  const fonts = await page.evaluate(async () => {
    const headingFonts = await document.fonts.load('600 24px "Satoshi"')
    const bodyFonts = await document.fonts.load('400 16px "Geist Sans"')
    return [headingFonts.length, bodyFonts.length]
  })
  expect(fonts.every(count => count > 0)).toBe(true)
  const canvas = await page.locator('html').evaluate(element => getComputedStyle(element).backgroundColor)
  expect(canvas).not.toBe('rgba(0, 0, 0, 0)')
  const island = page.locator('.n3wth-site-navigation-island')
  await expect(island).toHaveCSS('height', '48px')
  await expect(island).toHaveCSS('border-top-width', '1px')
  await expect(island).toHaveCSS('backdrop-filter', 'none')
  await expect(page.locator('.n3wth-site-footer')).toHaveCount(1)
  const toggle = page.locator('.n3wth-site-navigation-toggle')
  if (await toggle.isVisible()) {
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('.n3wth-site-navigation-links').getByRole('link').first()).toBeVisible()
    await expect(page.locator('.n3wth-site-navigation-links').getByRole('link').first()).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toBeFocused()
  }
}
