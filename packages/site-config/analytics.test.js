import { test } from 'node:test'
import assert from 'node:assert/strict'
import { captureEmailSignup, GA_MEASUREMENT_ID, googleAnalyticsScript, initializeSiteAnalytics, shouldExcludeTraffic, captureSiteEvent } from './analytics.js'

Object.defineProperty(globalThis, 'location', { configurable: true, value: { hostname: 'n3wth.com', search: '' } })

test('shares one public GA4 measurement ID and filtered deferred bootstrap', () => {
  assert.equal(GA_MEASUREMENT_ID, 'G-4QRMSG5HXK')
  assert.match(googleAnalyticsScript, /requestIdleCallback/)
  assert.match(googleAnalyticsScript, /n3wth_internal_traffic/)
  assert.match(googleAnalyticsScript, /n3wth:route-change/)
  assert.match(googleAnalyticsScript, new RegExp(GA_MEASUREMENT_ID, 'g'))
})

test('initializes once per client and preserves app policy', () => {
  const calls = []
  const client = { init: (...args) => calls.push(args) }
  const options = { api_host: 'https://example.com', capture_pageview: false }
  initializeSiteAnalytics(client, options)
  initializeSiteAnalytics(client, options)
  assert.equal(calls.length, 1)
  assert.equal(calls[0][1].api_host, options.api_host)
  assert.equal(calls[0][1].capture_pageview, false)
  assert.equal(calls[0][1].person_profiles, 'identified_only')
})

test('failed initialization can retry', () => {
  let attempts = 0
  const client = { init() { if (++attempts === 1) throw new Error('unavailable') } }
  assert.throws(() => initializeSiteAnalytics(client, { api_host: 'https://example.com' }))
  initializeSiteAnalytics(client, { api_host: 'https://example.com' })
  assert.equal(attempts, 2)
})

test('excludes local, preview, internal, and automated traffic', () => {
  assert.equal(shouldExcludeTraffic({ hostname: 'localhost', search: '' }), true)
  assert.equal(shouldExcludeTraffic({ hostname: 'preview.vercel.app', search: '' }, 'Mozilla/5.0'), true)
  assert.equal(shouldExcludeTraffic({ hostname: 'n3wth.com', search: '?n3wth_internal=1' }, 'Mozilla/5.0'), true)
  assert.equal(shouldExcludeTraffic({ hostname: 'n3wth.com', search: '' }, 'Playwright'), true)
  assert.equal(shouldExcludeTraffic({ hostname: 'n3wth.com', search: '' }, 'Mozilla/5.0'), false)
})

test('captureSiteEvent uses the shared event boundary', () => {
  const calls = []
  const client = { capture: (...args) => calls.push(args) }
  captureSiteEvent(client, 'install_started', { content_id: 'button' })
  assert.deepEqual(calls, [['install_started', { content_id: 'button' }]])
})

test('captureEmailSignup identifies the person before recording the event', () => {
  const calls = []
  const client = {
    setPersonProperties: properties => calls.push(['set', properties]),
    capture: event => calls.push(['capture', event]),
  }
  captureEmailSignup(client, 'reader@example.com')
  assert.deepEqual(calls, [['set', { email: 'reader@example.com' }], ['capture', 'email_captured']])
})
