import { siteUrls } from './index.js'

const productionEndpoint = `${siteUrls.home}/api/subscribe`
const productionOrigins = ['home', 'skills', 'garden', 'r3', 'ui'].map(source => siteUrls[source])
const errorMessages = {
  subscription_unavailable: 'We could not subscribe this address. Contact hey@n3wth.com for help.',
  invalid_request: 'Enter a valid email address.',
  rate_limited: 'Too many attempts. Please wait and try again.',
  service_unavailable: 'That did not go through. Try again.',
}

export function newsletterErrorMessage(error) {
  return errorMessages[error?.code] || errorMessages.service_unavailable
}

function subscriptionError(code = 'service_unavailable') {
  return Object.assign(new Error(errorMessages[code] || errorMessages.service_unavailable), { code })
}

/** Require an explicit isolated endpoint outside the source's public site. */
export function newsletterEndpoint(source, { endpoint, origin = globalThis.location?.origin } = {}) {
  if (!['home', 'skills', 'garden', 'r3', 'ui'].includes(source)) throw subscriptionError()
  const production = origin === siteUrls[source]
  if (!endpoint && !production) throw subscriptionError()
  const url = new URL(endpoint || productionEndpoint, origin)
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw subscriptionError()
  if (!production && productionOrigins.includes(url.origin)) throw subscriptionError()
  return url.href
}

/** Resolve only after the subscription API confirms delivery. Never expose provider errors. */
export async function submitNewsletter(address, source, options = {}) {
  const endpoint = newsletterEndpoint(source, options)
  let response
  let body
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: address.trim(), source }),
      credentials: 'omit',
      signal: AbortSignal.timeout(25000),
    })
    body = await response.json()
  } catch {
    throw subscriptionError()
  }
  if (!response.ok || body?.ok !== true) throw subscriptionError(body?.code)
}
