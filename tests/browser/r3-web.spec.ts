import { test, expect } from '@playwright/test'

test('r3 redirects its landing page to the portfolio project page', async ({ request }) => {
  const response = await request.get('/', { maxRedirects: 0 })
  expect(response.status()).toBe(308)
  expect(response.headers().location).toBe('https://n3wth.com/projects/r3')
})

test('r3 documentation redirects to the shared docs host', async ({ request }) => {
  const response = await request.get('/docs/quickstart', { maxRedirects: 0 })
  expect(response.status()).toBe(308)
  expect(response.headers().location).toBe('https://docs.n3wth.com/r3/quickstart')
})

test('legacy r3 documentation maps to existing replacement pages', async ({ request }) => {
  for (const [legacy, current] of [
    ['introduction', 'quickstart'], ['installation', 'quickstart'],
    ['api-reference', 'memory-tools'], ['api/client', 'memory-tools'],
    ['sdks/python', 'transport'], ['examples/chatbot-memory', 'memory-tools'],
  ]) {
    const response = await request.get(`/docs/${legacy}`, { maxRedirects: 0 })
    expect(response.status()).toBe(308)
    expect(response.headers().location).toBe(`https://docs.n3wth.com/r3/${current}`)
  }
})
