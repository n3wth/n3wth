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
}
