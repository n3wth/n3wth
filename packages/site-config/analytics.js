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

/** Records a footer signup. The identified person profile is the list until a mailing provider exists. */
export function captureEmailSignup(client, email) {
  client.setPersonProperties({ email })
  client.capture('email_captured')
}
