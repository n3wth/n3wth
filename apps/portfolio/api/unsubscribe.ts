interface UnsubscribeEnv {
  RESEND_API_KEY?: string
  RESEND_UNSUBSCRIBE_SECRET?: string
  RESEND_TOPIC_IDS?: string
}

const PLEX_TOPIC = 'ad622614-9af0-4edb-846f-9e200c4bfa97'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const encoder = new TextEncoder()

function encode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decode(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), character => character.charCodeAt(0))
}

async function signingKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

/** Tokens identify one contact/topic pair and never contain an email address. */
export async function createUnsubscribeUrl(contactId: string, topicId: string, secret: string): Promise<string> {
  if (!UUID.test(contactId) || !UUID.test(topicId) || secret.length < 32) throw new Error('Invalid unsubscribe configuration')
  const payload = encode(encoder.encode(JSON.stringify({ v: 1, c: contactId, t: topicId })))
  const signature = await crypto.subtle.sign('HMAC', await signingKey(secret), encoder.encode(payload))
  return `https://n3wth.com/api/unsubscribe?token=${payload}.${encode(new Uint8Array(signature))}`
}

function page(title: string, message: string, status: number, token?: string): Response {
  // All copy is static. The optional token has already passed a base64url allowlist.
  const form = token ? `<form method="post" action="/api/unsubscribe?token=${token}"><button type="submit">Unsubscribe</button></form>` : ''
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · n3wth</title></head><body><main><p>n3wth</p><h1>${title}</h1><p>${message}</p>${form}<p><a href="https://n3wth.com">Return to n3wth.com</a></p></main></body></html>`, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
      ...(status === 405 ? { Allow: 'GET, POST' } : {}),
    },
  })
}

export async function handleUnsubscribeRequest(request: Request, env: UnsubscribeEnv, fetchImpl: typeof fetch = fetch): Promise<Response> {
  if (!['GET', 'POST'].includes(request.method)) return page('Method not allowed', 'Open the unsubscribe link in your email.', 405)
  const secret = env.RESEND_UNSUBSCRIBE_SECRET
  if (!secret || secret.length < 32 || !env.RESEND_API_KEY) return page('Please try again', 'Email preferences are temporarily unavailable.', 503)
  const url = new URL(request.url)
  const token = url.searchParams.get('token') ?? ''
  if (url.searchParams.getAll('token').length !== 1 || token.length > 512 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(token)) {
    return page('Invalid link', 'Use the unsubscribe link from your email.', 400)
  }
  let contactId: string
  let topicId: string
  try {
    const [payload, signature] = token.split('.')
    if (!await crypto.subtle.verify('HMAC', await signingKey(secret), decode(signature), encoder.encode(payload))) throw new Error('Invalid signature')
    const parsed: unknown = JSON.parse(new TextDecoder().decode(decode(payload)))
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid payload')
    const value = parsed as { v?: unknown; c?: unknown; t?: unknown }
    if (value.v !== 1 || typeof value.c !== 'string' || typeof value.t !== 'string' || !UUID.test(value.c) || !UUID.test(value.t)) throw new Error('Invalid identifiers')
    const configured: unknown = JSON.parse(env.RESEND_TOPIC_IDS ?? '{}')
    if (!configured || typeof configured !== 'object' || Array.isArray(configured)) throw new Error('Invalid topics')
    const allowed = [PLEX_TOPIC, ...Object.values(configured)]
    if (!allowed.includes(value.t)) throw new Error('Unknown topic')
    contactId = value.c
    topicId = value.t
  } catch {
    return page('Invalid link', 'Use the unsubscribe link from your email.', 400)
  }
  // GET is deliberately inert: email security scanners must not unsubscribe users.
  if (request.method === 'GET') return page('Unsubscribe from these updates?', 'Your other email subscriptions will stay unchanged.', 200, token)
  try {
    const response = await fetchImpl(`https://api.resend.com/contacts/${contactId}/topics`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([{ id: topicId, subscription: 'opt_out' }]),
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) throw new Error('Preference update unavailable')
    return page('You’re unsubscribed', 'You will no longer receive these updates. Your other subscriptions are unchanged.', 200)
  } catch {
    return page('Please try again', 'We could not save your preference. Please try this link again shortly.', 503)
  }
}
