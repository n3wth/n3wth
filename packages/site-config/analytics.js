const initialized = new WeakSet()

export const GA_MEASUREMENT_ID = 'G-4QRMSG5HXK'
export const NEWSLETTER_SUBSCRIBED_EVENT = 'newsletter_subscribed'
export const NEWSLETTER_SOURCES = Object.freeze(['home', 'skills', 'garden', 'r3', 'ui'])

const excludedHostnames = ['localhost', '127.0.0.1', '[::1]']
const excludedHostnameSuffixes = ['.vercel.app', '.pages.dev', '.workers.dev']
const agentUserAgent = /bot|crawler|spider|headless|lighthouse|playwright|puppeteer|agent/i
const emailValue = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emailKey = /email/i
const defaultAutocaptureIgnorelist = Object.freeze([
  '.ph-no-capture',
  '.ph-no-autocapture',
  '[data-ph-no-capture]',
  '[data-ph-no-autocapture]',
  'input[type="email"]',
  'input[autocomplete="email"]',
  '.n3wth-site-signup',
  '.n3wth-site-signup *',
])

/** Explicit opt-out markers keep local, preview, internal, and automated traffic out of production reports. */
export function shouldExcludeTraffic(location = globalThis.location, userAgent = globalThis.navigator?.userAgent ?? '') {
  if (!location) return true
  const hostname = location.hostname.toLowerCase()
  const query = new URLSearchParams(location.search)
  let internalTraffic = false
  try {
    internalTraffic = globalThis.localStorage?.getItem('n3wth_internal_traffic') === '1'
  } catch {
    /* Storage can be unavailable in privacy-restricted browsers. */
  }
  return excludedHostnames.includes(hostname)
    || excludedHostnameSuffixes.some(suffix => hostname.endsWith(suffix))
    || query.has('ph_disable')
    || query.get('analytics') === 'off'
    || query.has('n3wth_internal')
    || internalTraffic
    || userAgent.search(agentUserAgent) !== -1
}

function looksLikeEmail(value) {
  return typeof value === 'string' && emailValue.test(value.trim())
}

function stripEmailFields(value) {
  if (Array.isArray(value)) return value.map(stripEmailFields)
  if (!value || typeof value !== 'object') return looksLikeEmail(value) ? undefined : value
  const next = {}
  for (const [key, nested] of Object.entries(value)) {
    if (emailKey.test(key) || looksLikeEmail(nested)) continue
    const cleaned = stripEmailFields(nested)
    if (cleaned !== undefined) next[key] = cleaned
  }
  return next
}

/** Drops subscriber addresses from outgoing events. Older identified signup records stay in PostHog. */
export function sanitizeAnalyticsEvent(event) {
  if (!event || typeof event !== 'object') return event
  const properties = stripEmailFields(event.properties ?? {})
  const sanitized = {
    ...event,
    properties,
    ...('$set' in event ? { $set: stripEmailFields(event.$set) } : {}),
    ...('$set_once' in event ? { $set_once: stripEmailFields(event.$set_once) } : {}),
  }
  if (sanitized.event !== NEWSLETTER_SUBSCRIBED_EVENT) return sanitized
  const reserved = Object.fromEntries(Object.entries(properties).filter(([key]) => key.startsWith('$')))
  const source = NEWSLETTER_SOURCES.includes(properties.source) ? properties.source : undefined
  sanitized.properties = source ? { ...reserved, source } : reserved
  return sanitized
}

export function createSiteAnalyticsBeforeSend(appBeforeSend) {
  return event => {
    if (shouldExcludeTraffic()) return null
    const sanitized = sanitizeAnalyticsEvent(event)
    if (sanitized == null) return null
    return typeof appBeforeSend === 'function' ? appBeforeSend(sanitized) : sanitized
  }
}

function mergeAutocapture(autocapture) {
  if (autocapture === false) return false
  const app = autocapture && typeof autocapture === 'object' ? autocapture : {}
  return {
    ...app,
    css_selector_ignorelist: [...new Set([
      ...defaultAutocaptureIgnorelist,
      ...(Array.isArray(app.css_selector_ignorelist) ? app.css_selector_ignorelist : []),
    ])],
  }
}

/** Keeps email out of autocapture and recordings even when apps pass their own init options. */
export function withSiteAnalyticsPrivacy(options = {}) {
  const {
    before_send: appBeforeSend,
    autocapture: appAutocapture,
    session_recording: appSessionRecording,
    ...rest
  } = options
  return {
    ...rest,
    session_recording: {
      ...(appSessionRecording && typeof appSessionRecording === 'object' ? appSessionRecording : {}),
      maskAllInputs: true,
    },
    autocapture: mergeAutocapture(appAutocapture),
    before_send: createSiteAnalyticsBeforeSend(appBeforeSend),
  }
}

/** Apps supply their installed client and host policy; UI never initializes analytics. */
export function initializeSiteAnalytics(client, options) {
  if (initialized.has(client)) return
  client.init('phc_q39ZGuvXLQuwCgCkHZYAeaUlWm5bIhx2XKMCtTdhJ7o', withSiteAnalyticsPrivacy({
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    ...options,
  }))
  initialized.add(client)
}

export function captureSiteEvent(client, event, properties = {}) {
  if (!shouldExcludeTraffic()) client.capture(event, properties)
}

/**
 * Success-only newsletter analytics. Source site only; never writes a person profile or address.
 * Swallows client errors so a failed capture cannot fail the subscription.
 */
export function captureNewsletterSubscribed(client, source) {
  try {
    if (!client || shouldExcludeTraffic()) return
    if (!NEWSLETTER_SOURCES.includes(source)) return
    client.capture(NEWSLETTER_SUBSCRIBED_EVENT, { source })
  } catch {
    /* analytics must never fail an otherwise successful subscription */
  }
}

/** Inline equivalent for server-rendered layouts; keeps the same policy without a client component. */
export const googleAnalyticsScript = `
(function () {
  var location = window.location;
  var query = new URLSearchParams(location.search);
  var hostname = location.hostname.toLowerCase();
  var excluded = ['localhost', '127.0.0.1', '[::1]'].indexOf(hostname) !== -1
    || ['.vercel.app', '.pages.dev', '.workers.dev'].some(function (suffix) { return hostname.endsWith(suffix); })
    || query.has('ph_disable') || query.get('analytics') === 'off' || query.has('n3wth_internal')
    || window.navigator.userAgent.search(/bot|crawler|spider|headless|lighthouse|playwright|puppeteer|agent/i) !== -1;
  try { excluded = excluded || window.localStorage.getItem('n3wth_internal_traffic') === '1'; } catch (_) {}
  if (excluded || window.__n3wthGoogleAnalyticsInitialized) return;
  window.__n3wthGoogleAnalyticsInitialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  var path = function () { return window.location.pathname + window.location.search; };
  var lastPath = path();
  var pageview = function () {
    var nextPath = path();
    if (nextPath === lastPath && window.gtag.loaded) return;
    lastPath = nextPath;
    window.gtag('config', '${GA_MEASUREMENT_ID}', { page_path: nextPath });
  };
  var idle = window.requestIdleCallback || function (callback) { window.setTimeout(callback, 1); };
  idle(function () {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
    script.onload = function () {
      window.gtag('js', new Date());
      window.gtag('config', '${GA_MEASUREMENT_ID}', { page_path: path() });
      window.gtag.loaded = true;
    };
    document.head.appendChild(script);
  });
  ['pushState', 'replaceState'].forEach(function (method) {
    var original = window.history[method];
    window.history[method] = function () {
      var result = original.apply(this, arguments);
      window.dispatchEvent(new Event('n3wth:route-change'));
      return result;
    };
  });
  window.addEventListener('popstate', pageview);
  window.addEventListener('n3wth:route-change', pageview);
}());
`

/** Starts the deferred GA4 browser tag and records client-side route changes. */
export function initializeGoogleAnalytics() {
  if (typeof window === 'undefined' || shouldExcludeTraffic()) return
  if (window.__n3wthGoogleAnalyticsInitialized) return
  window.__n3wthGoogleAnalyticsInitialized = true

  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments) }
  const currentPath = () => window.location.pathname + window.location.search
  let lastPath = currentPath()
  const pageview = () => {
    const path = currentPath()
    if (path === lastPath && window.gtag.loaded) return
    lastPath = path
    window.gtag('config', GA_MEASUREMENT_ID, { page_path: path })
  }
  const callback = window.requestIdleCallback || (cb => window.setTimeout(cb, 1))
  callback(() => {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    script.onload = () => {
      window.gtag('js', new Date())
      window.gtag('config', GA_MEASUREMENT_ID, { page_path: currentPath() })
      window.gtag.loaded = true
    }
    document.head.appendChild(script)
  })
  for (const method of ['pushState', 'replaceState']) {
    const original = window.history[method]
    window.history[method] = function (...args) {
      const result = original.apply(this, args)
      window.dispatchEvent(new Event('n3wth:route-change'))
      return result
    }
  }
  window.addEventListener('popstate', pageview)
  window.addEventListener('n3wth:route-change', pageview)
}
