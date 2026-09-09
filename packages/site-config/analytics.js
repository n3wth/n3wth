const initialized = new WeakSet()

/** Apps supply their installed client and host policy; UI never initializes analytics. */
export function initializeSiteAnalytics(client, options) {
  if (initialized.has(client)) return
  client.init('phc_q39ZGuvXLQuwCgCkHZYAeaUlWm5bIhx2XKMCtTdhJ7o', {
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    ...options,
  })
  initialized.add(client)
}
