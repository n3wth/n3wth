import { test, expect } from '@playwright/test'

test('UI redirects its landing page to the portfolio', async ({ request }) => {
  const response = await request.get('/', { maxRedirects: 0 })
  expect(response.status()).toBe(301)
  expect(response.headers().location).toBe('https://n3wth.com/projects/ui')
})

test('UI redirects legacy and current docs to the shared docs host', async ({ request }) => {
  for (const [source, target] of [['theming', 'theme-provider'], ['theming/', 'theme-provider'], ['', 'quickstart'], ['future/page', 'future/page']]) {
    const response = await request.get(`/docs/${source}?from=legacy`, { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    expect(response.headers().location).toBe(`https://docs.n3wth.com/ui/${target}?from=legacy`)
  }
})
