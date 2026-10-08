import { flushAnalytics } from './analytics'
import { initializeGoogleAnalytics, withSiteAnalyticsPrivacy } from '@n3wth/site-config/analytics'

initializeGoogleAnalytics()

// Defer PostHog init to after first paint - not needed for FCP/LCP.
// Configuration tuned to avoid blocking critical path:
// - No session recording on marketing pages (load-heavy, not needed for analytics)
// - No autocapture extras (dead-clicks, rage-clicks, exceptions load separately)
// - Defer feature flags to avoid /decide request before interactive
const deferCallback = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1))
deferCallback(() => {
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init('phc_q39ZGuvXLQuwCgCkHZYAeaUlWm5bIhx2XKMCtTdhJ7o', withSiteAnalyticsPrivacy({
      api_host: 'https://elephant.n3wth.com',
      ui_host: 'https://us.i.posthog.com',
      defaults: '2026-01-30',
      person_profiles: 'identified_only',
      capture_pageview: 'history_change',
      capture_pageleave: true,
      // Web vitals still captured, but deferred with the rest of PostHog
      capture_performance: { web_vitals: true },
      disable_surveys: true,
      // Disable features that load extra scripts before LCP
      disable_session_recording: true,
      disable_web_experiments: true,
      autocapture: {
        dom_event_allowlist: ['click', 'submit'],
        element_allowlist: ['a', 'button', 'form', 'input', 'select', 'textarea'],
      },
      // Prevent /decide (flags) call from blocking - bootstrap with empty state
      advanced_disable_decide: true,
      bootstrap: { featureFlags: {} },
    }) as Parameters<typeof posthog.init>[1])
    flushAnalytics()
  })
})
