import { test, expect } from '@playwright/test'

test('UI publishes the portfolio redirect for its landing page', async ({ request }) => {
  const redirects = await (await request.get('/_redirects')).text()
  expect(redirects).toContain('/* https://n3wth.com/projects/ui 301')
})

test('UI publishes the shared docs redirect', async ({ request }) => {
  const redirects = await (await request.get('/_redirects')).text()
  expect(redirects).toContain('/docs/* https://docs.n3wth.com/ui/:splat 301')
})
