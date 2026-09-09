// Run against a built shared-site starter: node scripts/check-site-browser.mjs URL
import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'

const url = process.argv[2]
if (!url) throw new Error('Pass the URL of a built shared-site starter')
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errors = []
  const fonts = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('response', response => {
    if (response.url().endsWith('.woff2')) fonts.push({ url: response.url(), status: response.status() })
  })
  await page.goto(url)
  await page.evaluate(async () => {
    await document.fonts.load('600 39px Satoshi')
    await document.fonts.load('400 16px "Geist Sans"')
    await document.fonts.ready
  })
  const actual = await page.evaluate(() => ({
    background: getComputedStyle(document.documentElement).backgroundColor,
    scheme: getComputedStyle(document.documentElement).colorScheme,
    titleColor: getComputedStyle(document.querySelector('h1')).color,
    titleFont: getComputedStyle(document.querySelector('h1')).fontFamily,
    loaded: [...document.fonts].filter(font => font.status === 'loaded').map(font => font.family),
    overflow: document.documentElement.scrollWidth > innerWidth,
  }))
  assert.equal(actual.background, 'rgb(8, 9, 11)')
  assert.equal(actual.scheme, 'dark')
  assert.equal(actual.titleColor, 'rgb(242, 243, 245)')
  assert.match(actual.titleFont, /Satoshi/)
  assert(actual.loaded.includes('Satoshi'))
  assert(actual.loaded.includes('Geist Sans'))
  assert(fonts.length >= 2)
  assert(fonts.every(font => font.status === 200))
  assert.equal(actual.overflow, false)
  assert.deepEqual(errors, [])
  await page.setViewportSize({ width: 390, height: 844 })
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  console.log(JSON.stringify({ ...actual, fonts, mobileOverflow: false, errors }, null, 2))
} finally {
  await browser.close()
}
