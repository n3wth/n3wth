/* Thin wrapper over the deferred PostHog instance from src/main.tsx.
   posthog-js is loaded lazily after first paint, so events fired before
   it lands queue here and flush once init completes. Never throws. */

import { captureEmailSignup, captureSiteEvent } from '@n3wth/site-config/analytics'
import type { PostHog } from 'posthog-js'

type Props = Record<string, string | number | boolean | undefined>

const queue: Array<(posthog: PostHog) => void> = []
let ready = false

function run(job: (posthog: PostHog) => void) {
  try {
    if (!ready) {
      queue.push(job)
      return
    }
    void import('posthog-js').then(({ default: posthog }) => job(posthog))
  } catch {
    /* analytics must never break the page */
  }
}

export function track(event: string, props?: Props) {
  run(posthog => captureSiteEvent(posthog, event, props))
}

export function trackSignup(email: string) {
  run(posthog => captureEmailSignup(posthog, email))
}

export function trackOutbound(url: string, source?: string) {
  track('outbound_link_clicked', { url, ...(source && { source }) })
}

/** Called once by main.tsx after posthog.init. */
export function flushAnalytics() {
  ready = true
  for (const job of queue.splice(0)) run(job)
}
