import { test, expect } from '@playwright/test'
import { expectSiteFoundation } from './site-foundation'

test('home loads the shared theme and font assets', async ({ page }) => {
  await page.goto('/')
  await expectSiteFoundation(page)
})

for (const route of ['/', '/components', '/docs/getting-started', '/docs/agents', '/blog', '/blog/install-and-check-a-kit-button']) {
  test(`Kit renders ${route}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    const response = await page.goto(route)
    expect(response?.ok()).toBe(true)
    await expect(page.locator('h1').first()).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
    expect(errors).toEqual([])
  })
}

test('registry remains downloadable', async ({ request }) => {
  const response = await request.get('/r/button.json')
  expect(response.ok()).toBe(true)
  const button = await response.json()
  expect(button.name).toBe('button')
  expect(button.registryDependencies).toEqual(['https://kit.n3wth.com/r/cn.json'])
  const utility = await request.get('/r/cn.json')
  expect(utility.ok()).toBe(true)
  expect((await utility.json()).dependencies).toEqual(['clsx', 'tailwind-merge'])
})

test('AI context guide links to a usable component reference', async ({ page, request }) => {
  await page.goto('/docs/agents')
  await expect(page.getByRole('heading', { name: 'AI context', exact: true })).toBeVisible()
  const download = page.getByRole('link', { name: 'Download GEMINI.md', exact: true })
  await expect(download).toHaveAttribute('href', '/ai/GEMINI.md')
  const response = await request.get('/ai/GEMINI.md')
  expect(response.status()).toBe(200)
  const context = await response.text()
  expect(context).toContain('https://kit.n3wth.com/r/[name].json')
  expect(context).toContain('## Component Catalog')
})

test('button tutorial demonstrates pointer and keyboard activation', async ({ page, request }, testInfo) => {
  await page.goto('/blog')
  await page.getByRole('link', { name: /Install and check a Kit button/ }).click()
  await expect(page).toHaveURL(/\/blog\/install-and-check-a-kit-button$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Install and check a Kit button')
  const button = page.getByRole('button', { name: 'Check button', exact: true })
  await button.click()
  await expect(page.getByRole('status')).toContainText('Pressed 1 time.')
  await button.press('Enter')
  await expect(page.getByRole('status')).toContainText('Pressed 2 times.')
  await button.press('Space')
  await expect(page.getByRole('status')).toContainText('Pressed 3 times.')
  const bounds = await button.boundingBox()
  expect(bounds!.height).toBeGreaterThanOrEqual(44)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('button-tutorial.png') })
  await page.goBack()
  await expect(page).toHaveURL(/\/blog$/)
  const sitemap = await request.get('/sitemap.xml')
  expect(await sitemap.text()).toContain('https://kit.n3wth.com/blog/install-and-check-a-kit-button')
})

test('button tutorial copies the actual registry command', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/blog/install-and-check-a-kit-button')
  await page.getByRole('group', { name: 'Install Kit button', exact: true })
    .getByRole('button', { name: 'Copy code', exact: true }).click()
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe('npx shadcn add https://kit.n3wth.com/r/button.json')
})

for (const slug of ['install-and-check-a-kit-button', 'shadcn-registry-protocol', 'shadcn-registry-protocol-deep-dive']) {
  test(`article lists keep markers outside wrapped text: ${slug}`, async ({ page }, testInfo) => {
    await page.goto(`/blog/${slug}`)
    const paragraphColor = await page.locator('main p').last().evaluate(element => getComputedStyle(element).color)
    for (const list of await page.locator('main ol, main ul').all()) {
      const styles = await list.evaluate(element => {
        const computed = getComputedStyle(element)
        return { position: computed.listStylePosition, padding: parseFloat(computed.paddingInlineStart), color: computed.color }
      })
      expect(styles.position).toBe('outside')
      expect(styles.padding).toBeGreaterThanOrEqual(24)
      expect(styles.color).toBe(paragraphColor)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
    await page.locator('main ol').first().scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath('numbered-list.png') })
    await page.locator('main ul').first().scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath('bulleted-list.png') })
  })
}
