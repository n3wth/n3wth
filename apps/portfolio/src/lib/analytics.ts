/* Thin wrapper over the deferred PostHog instance from src/main.tsx.
   posthog-js is loaded lazily after first paint, so events fired before
   it lands queue here and flush once init completes. Never throws. */

type Props = Record<string, string | number | boolean | undefined>

const queue: Array<[string, Props | undefined]> = []
let ready = false

export function track(event: string, props?: Props) {
  try {
    if (!ready) {
      queue.push([event, props])
      return
    }
    void import('posthog-js').then(({ default: posthog }) => {
      posthog.capture(event, props)
    })
  } catch {
    /* analytics must never break the page */
  }
}

/** Called once by main.tsx after posthog.init. */
export function flushAnalytics() {
  ready = true
  for (const [event, props] of queue.splice(0)) track(event, props)
}
