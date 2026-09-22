import { test, expect } from '@playwright/test'

test('Garden redirects old entry points and nested notes', async ({ request }) => {
  for (const [path, target] of [
    ['/', '/'], ['/world', '/'], ['/notes', '/thinking#notes'],
    ['/frameworks/5-whys', '/thinking/frameworks/5-whys'],
  ]) {
    const response = await request.get(path, { maxRedirects: 0 })
    expect(response.status()).toBe(308)
    expect(response.headers().location).toBe(`https://n3wth.com${target}`)
  }
  expect((await request.get('/no-such-garden-note', { maxRedirects: 0 })).status()).toBe(404)
  expect((await request.get('/__health')).status()).toBe(200)
})
