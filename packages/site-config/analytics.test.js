import { test } from 'node:test'
import assert from 'node:assert/strict'
import { initializeSiteAnalytics } from './analytics.js'

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
