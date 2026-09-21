import { afterEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { newsletterEndpoint, newsletterErrorMessage, submitNewsletter } from './newsletter.js'
import { siteUrls } from './index.js'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

test('each production site uses the shared subscription endpoint', () => {
  for (const source of ['home', 'skills', 'garden', 'r3', 'ui']) {
    assert.equal(newsletterEndpoint(source, { origin: siteUrls[source] }), 'https://n3wth.com/api/subscribe')
  }
})

test('previews and local sites cannot silently send subscriptions to production', () => {
  for (const origin of ['http://localhost:5173', 'https://skills-pr-12.preview.n3wth.com']) {
    assert.throws(() => newsletterEndpoint('skills', { origin }))
    assert.throws(() => newsletterEndpoint('skills', { origin, endpoint: 'https://n3wth.com/api/subscribe' }))
    assert.equal(newsletterEndpoint('skills', { origin, endpoint: 'https://portfolio-pr-12.preview.n3wth.com/api/subscribe' }), 'https://portfolio-pr-12.preview.n3wth.com/api/subscribe')
  }
  assert.throws(() => newsletterEndpoint('other', { origin: siteUrls.home }))
  assert.throws(() => newsletterEndpoint('home', { origin: siteUrls.home, endpoint: 'https://user:secret@example.com' }))
})

test('posts the trimmed address and source and waits for confirmed success', async () => {
  let complete
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://n3wth.com/api/subscribe')
    assert.equal(options.method, 'POST')
    assert.equal(options.credentials, 'omit')
    assert.deepEqual(JSON.parse(options.body), { address: 'reader@example.com', source: 'home' })
    await new Promise(resolve => { complete = resolve })
    return Response.json({ ok: true })
  }
  let settled = false
  const pending = submitNewsletter(' reader@example.com ', 'home', { origin: siteUrls.home }).then(() => { settled = true })
  await Promise.resolve()
  assert.equal(settled, false)
  complete()
  await pending
  assert.equal(settled, true)
})

test('rejects suppression, rate limits, malformed success, HTTP errors and network failures', async () => {
  for (const response of [
    Response.json({ ok: false, code: 'subscription_unavailable' }, { status: 409 }),
    Response.json({ ok: false, code: 'rate_limited' }, { status: 429 }),
    Response.json({}),
    Response.json({ ok: true }, { status: 503 }),
    new Response('not json'),
  ]) {
    globalThis.fetch = async () => response
    await assert.rejects(submitNewsletter('reader@example.com', 'home', { origin: siteUrls.home }))
  }
  globalThis.fetch = async () => { throw new Error('private provider detail') }
  await assert.rejects(submitNewsletter('reader@example.com', 'home', { origin: siteUrls.home }), /That did not go through/)
  assert.equal(newsletterErrorMessage({ code: 'subscription_unavailable' }), 'We could not subscribe this address. Contact hey@n3wth.com for help.')
  assert.equal(newsletterErrorMessage(new Error('private detail')), 'That did not go through. Try again.')
})
