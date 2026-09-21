import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  captureNewsletterSubscribed,
  createSiteAnalyticsBeforeSend,
  GA_MEASUREMENT_ID,
  googleAnalyticsScript,
  initializeSiteAnalytics,
  isThirdPartyException,
  NEWSLETTER_SOURCES,
  NEWSLETTER_SUBSCRIBED_EVENT,
  sanitizeAnalyticsEvent,
  shouldExcludeTraffic,
  captureSiteEvent,
  withSiteAnalyticsPrivacy,
} from './analytics.js'

Object.defineProperty(globalThis, 'location', { configurable: true, value: { hostname: 'n3wth.com', search: '' } })

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const signupPaths = [
  'packages/site-config/analytics.js',
  'apps/portfolio/src/lib/analytics.ts',
  'apps/portfolio/src/components/Footer.tsx',
  'apps/skills/src/components/Footer.tsx',
  'apps/garden/src/components/SiteFooter.tsx',
  'apps/r3-web/components/FooterSignup.tsx',
  'apps/ui-docs/demo/Signup.tsx',
]

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
  assert.equal(calls[0][1].session_recording.maskAllInputs, true)
  assert.ok(calls[0][1].autocapture.css_selector_ignorelist.includes('input[type="email"]'))
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

test('captureNewsletterSubscribed records source site only after a valid source', () => {
  const calls = []
  const client = {
    setPersonProperties: properties => calls.push(['set', properties]),
    capture: (...args) => calls.push(['capture', ...args]),
  }
  captureNewsletterSubscribed(client, 'skills')
  assert.deepEqual(calls, [['capture', NEWSLETTER_SUBSCRIBED_EVENT, { source: 'skills' }]])
  assert.deepEqual([...NEWSLETTER_SOURCES], ['home', 'skills', 'garden', 'r3', 'ui'])
})

test('captureNewsletterSubscribed never writes a person profile or an address', () => {
  const calls = []
  const client = {
    setPersonProperties: properties => calls.push(['set', properties]),
    capture: (...args) => calls.push(args),
  }
  captureNewsletterSubscribed(client, 'reader@example.com')
  captureNewsletterSubscribed(client, 'not-a-site')
  assert.deepEqual(calls, [])
})

test('captureNewsletterSubscribed never fails a successful subscription', () => {
  assert.doesNotThrow(() => captureNewsletterSubscribed(null, 'home'))
  assert.doesNotThrow(() => captureNewsletterSubscribed({
    capture() { throw new Error('posthog down') },
  }, 'home'))
})

test('sanitizeAnalyticsEvent strips email profile writes and keeps unrelated events', () => {
  const pageview = sanitizeAnalyticsEvent({
    event: '$pageview',
    properties: { $current_url: 'https://n3wth.com/', $set: { email: 'reader@example.com' }, path: '/' },
    $set: { email: 'reader@example.com', theme: 'dark' },
  })
  assert.equal(pageview.event, '$pageview')
  assert.equal(pageview.properties.path, '/')
  assert.equal(pageview.properties.$set?.email, undefined)
  assert.equal(pageview.$set.theme, 'dark')
  assert.equal(pageview.$set.email, undefined)

  const signup = sanitizeAnalyticsEvent({
    event: NEWSLETTER_SUBSCRIBED_EVENT,
    properties: { source: 'home', email: 'reader@example.com', $lib: 'web' },
  })
  assert.deepEqual(signup.properties, { $lib: 'web', source: 'home' })
})

test('before_send sanitizer and privacy defaults stay applied when apps pass options', () => {
  const options = withSiteAnalyticsPrivacy({
    api_host: 'https://example.com',
    autocapture: { dom_event_allowlist: ['click'] },
    session_recording: { recordCrossOriginIframes: false },
    before_send: event => ({ ...event, tagged: true }),
  })
  assert.equal(options.session_recording.maskAllInputs, true)
  assert.equal(options.session_recording.recordCrossOriginIframes, false)
  assert.ok(options.autocapture.css_selector_ignorelist.includes('.n3wth-site-signup'))
  assert.deepEqual(options.autocapture.dom_event_allowlist, ['click'])
  const sent = options.before_send({ event: 'click', properties: { email: 'reader@example.com', href: '/' } })
  assert.equal(sent.tagged, true)
  assert.equal(sent.properties.email, undefined)
  assert.equal(sent.properties.href, '/')
  assert.equal(createSiteAnalyticsBeforeSend()({ event: 'x', properties: {} }).event, 'x')
})

test('before_send drops exceptions whose only frames are edge-injected third-party scripts', () => {
  const beforeSend = createSiteAnalyticsBeforeSend()
  const zarazFrame = { in_app: true, filename: 'https://ui.n3wth.com/cdn-cgi/zaraz/s.js?z=abc' }
  const thirdParty = {
    event: '$exception',
    properties: { $exception_list: [{ type: 'TypeError', value: 'Failed to fetch', stacktrace: { frames: [zarazFrame] } }] },
  }
  assert.equal(isThirdPartyException(thirdParty), true)
  assert.equal(beforeSend(thirdParty), null)

  const appException = {
    event: '$exception',
    properties: { $exception_list: [{ stacktrace: { frames: [{ filename: 'https://ui.n3wth.com/_next/static/app.js' }] } }] },
  }
  assert.equal(isThirdPartyException(appException), false)
  assert.equal(beforeSend(appException).event, '$exception')

  const mixed = {
    event: '$exception',
    properties: { $exception_list: [{ stacktrace: { frames: [zarazFrame, { filename: 'https://ui.n3wth.com/_next/static/app.js' }] } }] },
  }
  assert.equal(isThirdPartyException(mixed), false)

  const frameless = { event: '$exception', properties: { $exception_list: [{ type: 'TypeError', value: 'Failed to fetch' }] } }
  assert.equal(isThirdPartyException(frameless), false)
  assert.equal(beforeSend(frameless).event, '$exception')
})

test('signup paths do not write subscriber email to analytics', async () => {
  for (const relative of signupPaths) {
    const text = await readFile(resolve(workspaceRoot, relative), 'utf8')
    assert.doesNotMatch(text, /setPersonProperties/, relative)
    assert.doesNotMatch(text, /email_captured/, relative)
    assert.doesNotMatch(text, /captureEmailSignup/, relative)
  }
})
