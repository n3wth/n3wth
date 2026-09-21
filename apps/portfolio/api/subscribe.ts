/**
 * POST /api/subscribe
 *
 * Body: { address: string, source: 'home' | 'skills' | 'garden' | 'r3' | 'ui' }
 * Success: 200 { ok: true } after Resend confirms an active contact in the segment.
 * Errors use { ok: false, code }; opt-outs are never cleared.
 * CORS: exact allowed Origin only. Responses are Cache-Control: no-store.
 */
import { siteUrls } from '@n3wth/site-config'
import { createUnsubscribeUrl } from './unsubscribe'

export const SUBSCRIBE_PATH = '/api/subscribe'
export const SUBSCRIBE_MAX_BODY_BYTES = 2048
export const SUBSCRIBE_TIMEOUT_MS = 4000
export const SUBSCRIBE_TOTAL_TIMEOUT_MS = 20000
export const SUBSCRIBE_SOURCES = ['home', 'skills', 'garden', 'r3', 'ui'] as const
export type NewsletterSource = (typeof SUBSCRIBE_SOURCES)[number]

const RESEND_API = 'https://api.resend.com'
const ADDRESS_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PREVIEW_ORIGIN = /^https:\/\/(portfolio|skills|garden|r3-web|ui-docs)-pr-([1-9]\d{0,8})\.preview\.n3wth\.com$/
const PREVIEW_SOURCE: Record<string, NewsletterSource> = {
  portfolio: 'home',
  skills: 'skills',
  garden: 'garden',
  'r3-web': 'r3',
  'ui-docs': 'ui',
}

const PRODUCTION_ORIGINS: Readonly<Record<NewsletterSource, string>> = {
  home: siteUrls.home,
  skills: siteUrls.skills,
  garden: siteUrls.garden,
  r3: siteUrls.r3,
  ui: siteUrls.ui,
}

export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

export interface SubscribeEnv {
  RESEND_API_KEY?: string
  RESEND_SEGMENT_ID?: string
  RESEND_TOPIC_IDS?: string
  RESEND_WELCOME_TEMPLATE_ID?: string
  RESEND_WELCOME_FROM?: string
  RESEND_UNSUBSCRIBE_SECRET?: string
  SUBSCRIBE_ENVIRONMENT?: string
  SUBSCRIBE_PREVIEW_PR?: string
  SUBSCRIBE?: RateLimiter
}

type FetchImplementation = typeof fetch

export interface SubscribeOptions {
  timeoutMs?: number
  waitUntil?: (task: Promise<unknown>) => void
}

interface ProviderBudget {
  requestMs: number
  deadline: number
}

interface WelcomeConfig {
  templateId: string
  from: string
  source: NewsletterSource
  unsubscribeSecret: string
  waitUntil?: (task: Promise<unknown>) => void
}

// Resend keeps send idempotency keys for 24 hours. Stop uncertain automatic
// retries earlier, so an expired key can never produce a second welcome.
const WELCOME_RETRY_WINDOW_MS = 23 * 60 * 60 * 1000

function stringProperty(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  // Contact reads wrap custom properties as { value, type }, while writes use
  // flat values. Accept only the expected string type for welcome state.
  const property = readObject(value)
  return property?.type === 'string' && typeof property.value === 'string'
    ? property.value : undefined
}

async function sendPendingWelcome(
  fetchImpl: FetchImplementation,
  apiKey: string,
  contact: unknown,
  address: string,
  topicId: string,
  budget: ProviderBudget,
  welcome?: WelcomeConfig,
): Promise<void> {
  if (!welcome) return
  const record = readObject(contact)
  const properties = readObject(record?.properties)
  const id = contactId(contact)
  if (!id || stringProperty(properties?.website_welcome_status) !== 'pending'
    || stringProperty(properties?.website_signup_source) !== welcome.source) return
  const startedAt = stringProperty(properties?.website_welcome_started_at)
  const started = startedAt ? Date.parse(startedAt) : NaN
  const age = Date.now() - started
  if (!Number.isFinite(age) || age < 0 || age >= WELCOME_RETRY_WINDOW_MS) {
    logSubscribe('subscribe_welcome_pending', { reason: 'retry_window_expired', source: welcome.source })
    return
  }

  try {
    const unsubscribeUrl = await createUnsubscribeUrl(id, topicId, welcome.unsubscribeSecret)
    let emailId: string | undefined
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await resend(fetchImpl, apiKey, `${RESEND_API}/emails`, {
          method: 'POST',
          headers: { 'Idempotency-Key': `website-welcome-v1/${id}` },
          body: JSON.stringify({
            from: welcome.from,
            reply_to: 'hey@n3wth.com',
            to: [address],
            template: { id: welcome.templateId, variables: { UNSUBSCRIBE_URL: unsubscribeUrl } },
            topic_id: topicId,
            headers: {
              'List-Unsubscribe': `<${unsubscribeUrl}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          }),
        }, budget)
        if (response.ok) {
          emailId = contactId(await readJson(response))
          break
        }
        if (response.status < 500 || attempt === 1) break
      } catch (error) {
        if (!isTimeout(error) || attempt === 1) throw error
      }
    }
    if (!emailId) {
      logSubscribe('subscribe_welcome_pending', { reason: 'delivery_unconfirmed', source: welcome.source })
      return
    }
    const marked = await resend(fetchImpl, apiKey, resendPath('contacts', id), {
      method: 'PATCH',
      body: JSON.stringify({ properties: { website_welcome_status: 'sent', website_welcome_email_id: emailId } }),
    }, budget)
    if (!marked.ok) logSubscribe('subscribe_welcome_pending', { reason: 'receipt_unrecorded', source: welcome.source })
  } catch {
    // Membership is already confirmed. A delivery outage must not turn a valid
    // signup into a false failure; the durable marker permits a safe retry.
    logSubscribe('subscribe_welcome_pending', { reason: 'provider', source: welcome.source })
  }
}

type SubscribeError = 'invalid_request' | 'forbidden' | 'rate_limited' | 'subscription_unavailable' | 'service_unavailable'
type ProviderResult = 'ok' | 'suppressed' | 'timeout' | 'provider' | 'partial'

function isSubscribeSource(value: unknown): value is NewsletterSource {
  return typeof value === 'string' && (SUBSCRIBE_SOURCES as readonly string[]).includes(value)
}

export function allowedSubscribeOrigin(origin: string, env: SubscribeEnv = {}, requestOrigin = siteUrls.home): boolean {
  if (env.SUBSCRIBE_ENVIRONMENT === 'preview') {
    const match = origin.match(PREVIEW_ORIGIN)
    return Boolean(match && match[2] === env.SUBSCRIBE_PREVIEW_PR
      && requestOrigin === `https://portfolio-pr-${match[2]}.preview.n3wth.com`)
  }
  return (!env.SUBSCRIBE_ENVIRONMENT || env.SUBSCRIBE_ENVIRONMENT === 'production')
    && requestOrigin === siteUrls.home && Object.values(PRODUCTION_ORIGINS).includes(origin)
}

export function sourceForOrigin(origin: string): NewsletterSource | undefined {
  for (const [source, allowed] of Object.entries(PRODUCTION_ORIGINS)) {
    if (allowed === origin) return source as NewsletterSource
  }
  const preview = origin.match(PREVIEW_ORIGIN)
  return preview ? PREVIEW_SOURCE[preview[1]] : undefined
}

function corsHeaders(origin: string): Headers {
  return new Headers({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  })
}

function json(origin: string, body: unknown, status: number): Response {
  const headers = corsHeaders(origin)
  headers.set('Content-Type', 'application/json; charset=utf-8')
  return new Response(JSON.stringify(body), { status, headers })
}

function errorResponse(origin: string, error: SubscribeError, status: number, extra?: HeadersInit): Response {
  const response = json(origin, { ok: false, code: error }, status)
  if (extra) {
    const headers = new Headers(response.headers)
    new Headers(extra).forEach((value, key) => headers.set(key, value))
    return new Response(response.body, { status: response.status, headers })
  }
  return response
}

function clientAddress(request: Request): string {
  return request.headers.get('CF-Connecting-IP')?.trim() || 'unknown'
}

function logSubscribe(event: string, fields: Record<string, string | number | boolean> = {}): void {
  console.warn(JSON.stringify({ event, ...fields }))
}

export async function boundedText(request: Request, maximum: number): Promise<string> {
  const declared = request.headers.get('Content-Length')
  if (declared && Number(declared) > maximum) throw new Error('Body too large')
  const reader = request.body?.getReader()
  if (!reader) return ''
  const decoder = new TextDecoder()
  let size = 0
  let text = ''
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) return text + decoder.decode()
      size += value.byteLength
      if (size > maximum) throw new Error('Body too large')
      text += decoder.decode(value, { stream: true })
    }
  } finally {
    await reader.cancel()
  }
}

function normalizeAddress(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const address = value.trim().toLowerCase()
  if (address.length < 3 || address.length > 254 || !ADDRESS_PATTERN.test(address)) return undefined
  return address
}

function resendPath(resource: string, identity: string, suffix = ''): string {
  return `${RESEND_API}/${resource}/${encodeURIComponent(identity)}${suffix}`
}

async function resend(
  fetchImpl: FetchImplementation,
  apiKey: string,
  url: string,
  init: RequestInit,
  budget: ProviderBudget,
): Promise<Response> {
  const options = {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  }
  // Other Workers share the account's two-requests-per-second quota. Retry only
  // bounded 429s; exhausted limits fail closed and can be retried by the user.
  for (let attempt = 0; ; attempt += 1) {
    const remaining = budget.deadline - Date.now()
    if (remaining <= 0) throw new DOMException('Subscription deadline exceeded', 'TimeoutError')
    const response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(Math.min(budget.requestMs, remaining)) })
    if (response.status !== 429 || attempt === 2) return response
    const retryAfter = Number(response.headers.get('retry-after') || '1')
    if (!Number.isFinite(retryAfter) || retryAfter < 0 || retryAfter > 2) return response
    await response.body?.cancel()
    const waitMs = Math.max(1000, retryAfter * 1000)
    if (waitMs >= budget.deadline - Date.now()) throw new DOMException('Subscription deadline exceeded', 'TimeoutError')
    await new Promise(resolve => setTimeout(resolve, waitMs))
  }
}

function isTimeout(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'TimeoutError'
    || error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')
}

function readObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return undefined
  }
}

function contactId(value: unknown): string | undefined {
  const body = readObject(value)
  return typeof body?.id === 'string' && body.id ? body.id : undefined
}

function isUnsubscribed(value: unknown): boolean {
  return readObject(value)?.unsubscribed === true
}

function segmentIds(value: unknown): string[] {
  const body = readObject(value)
  const data = body?.data
  if (!Array.isArray(data)) return []
  return data.flatMap((item) => {
    const id = readObject(item)?.id
    return typeof id === 'string' && id ? [id] : []
  })
}

async function confirmMembership(
  fetchImpl: FetchImplementation,
  apiKey: string,
  address: string,
  segmentId: string,
  topicId: string,
  budget: ProviderBudget,
  welcome?: WelcomeConfig,
): Promise<ProviderResult> {
  const contactResponse = await resend(fetchImpl, apiKey, resendPath('contacts', address), { method: 'GET' }, budget)
  if (!contactResponse.ok) return 'partial'
  const contact = await readJson(contactResponse)
  if (isUnsubscribed(contact)) return 'suppressed'
  if (readObject(contact)?.unsubscribed !== false) return 'partial'
  const id = contactId(contact)
  if (!id) return 'partial'
  const segmentsResponse = await resend(fetchImpl, apiKey, resendPath('contacts', id, '/segments'), { method: 'GET' }, budget)
  if (!segmentsResponse.ok) return 'partial'
  if (!segmentIds(await readJson(segmentsResponse)).includes(segmentId)) return 'partial'
  const topic = await confirmTopic(fetchImpl, apiKey, id, topicId, budget)
  if (topic === 'ok' && welcome) {
    const delivery = sendPendingWelcome(fetchImpl, apiKey, contact, address, topicId,
      { requestMs: budget.requestMs, deadline: Date.now() + 15000 }, welcome)
    if (welcome.waitUntil) welcome.waitUntil(delivery)
    else await delivery
  }
  return topic
}

async function confirmTopic(fetchImpl: FetchImplementation, apiKey: string, identity: string, topicId: string, budget: ProviderBudget): Promise<ProviderResult> {
  let url: string | undefined = resendPath('contacts', identity, '/topics?limit=100')
  for (let page = 0; url && page < 10; page += 1) {
    const response = await resend(fetchImpl, apiKey, url, { method: 'GET' }, budget)
    if (!response.ok) return 'provider'
    const body = readObject(await readJson(response))
    if (!Array.isArray(body?.data)) return 'partial'
    const topics = body.data.map(readObject)
    const topic = topics.find(item => item?.id === topicId)
    if (topic?.subscription === 'opt_in') return 'ok'
    // Resend does not distinguish default opt-out from an explicit opt-out.
    // Preserve both; existing contacts can change this in their preferences.
    if (topic?.subscription === 'opt_out') return 'suppressed'
    const lastId = topics.at(-1)?.id
    if (body.has_more !== true || typeof lastId !== 'string') return 'partial'
    url = resendPath('contacts', identity, `/topics?limit=100&after=${encodeURIComponent(lastId)}`)
  }
  return 'partial'
}

async function addToSegment(
  fetchImpl: FetchImplementation,
  apiKey: string,
  identity: string,
  segmentId: string,
  budget: ProviderBudget,
): Promise<boolean> {
  const response = await resend(
    fetchImpl,
    apiKey,
    resendPath('contacts', identity, `/segments/${encodeURIComponent(segmentId)}`),
    { method: 'POST' },
    budget,
  )
  return response.ok || response.status === 409
}

async function subscribeWithResend(
  fetchImpl: FetchImplementation,
  apiKey: string,
  address: string,
  segmentId: string,
  topicId: string,
  budget: ProviderBudget,
  welcome?: WelcomeConfig,
): Promise<ProviderResult> {
  const suppression = await resend(fetchImpl, apiKey, resendPath('suppressions', address), { method: 'GET' }, budget)
  if (suppression.ok) return 'suppressed'
  if (suppression.status !== 404) return 'provider'

  const existing = await resend(fetchImpl, apiKey, resendPath('contacts', address), { method: 'GET' }, budget)
  if (existing.ok) {
    const contact = await readJson(existing)
    if (isUnsubscribed(contact)) return 'suppressed'
    if (readObject(contact)?.unsubscribed !== false) return 'partial'
    const id = contactId(contact) ?? address
    const topic = await confirmTopic(fetchImpl, apiKey, id, topicId, budget)
    if (topic !== 'ok') return topic
    const segmentsResponse = await resend(fetchImpl, apiKey, resendPath('contacts', id, '/segments'), { method: 'GET' }, budget)
    if (segmentsResponse.ok && segmentIds(await readJson(segmentsResponse)).includes(segmentId)) {
      return confirmMembership(fetchImpl, apiKey, address, segmentId, topicId, budget, welcome)
    }
    if (!await addToSegment(fetchImpl, apiKey, id, segmentId, budget)) return 'provider'
    return confirmMembership(fetchImpl, apiKey, address, segmentId, topicId, budget, welcome)
  }
  if (existing.status !== 404) return 'provider'

  const created = await resend(fetchImpl, apiKey, `${RESEND_API}/contacts`, {
    method: 'POST',
    body: JSON.stringify({
      email: address,
      unsubscribed: false,
      segments: [{ id: segmentId }],
      topics: [{ id: topicId, subscription: 'opt_in' }],
      ...(welcome ? { properties: {
        website_signup_source: welcome.source,
        website_welcome_status: 'pending',
        website_welcome_started_at: new Date().toISOString(),
      } } : {}),
    }),
  }, budget)
  if (!created.ok && created.status !== 409) return 'provider'
  const confirmed = await confirmMembership(fetchImpl, apiKey, address, segmentId, topicId, budget, welcome)
  if (confirmed !== 'partial') return confirmed
  if (!await addToSegment(fetchImpl, apiKey, address, segmentId, budget)) return 'partial'
  return confirmMembership(fetchImpl, apiKey, address, segmentId, topicId, budget, welcome)
}

export async function handleSubscribe(
  request: Request,
  env: SubscribeEnv = {},
  fetchImpl: FetchImplementation = fetch,
  options: SubscribeOptions = {},
): Promise<Response> {
  const origin = request.headers.get('Origin') ?? ''
  if (!allowedSubscribeOrigin(origin, env, new URL(request.url).origin)) {
    return new Response(JSON.stringify({ ok: false, code: 'forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) })
  if (request.method !== 'POST') return errorResponse(origin, 'invalid_request', 405)

  const apiKey = env.RESEND_API_KEY?.trim()
  const segmentId = env.RESEND_SEGMENT_ID?.trim()
  let topicIds: Record<string, unknown> | undefined
  try { topicIds = readObject(JSON.parse(env.RESEND_TOPIC_IDS || '')) } catch { /* Missing configuration fails closed. */ }
  if (!apiKey || !segmentId || !env.SUBSCRIBE || !topicIds
    || !SUBSCRIBE_SOURCES.every(source => typeof topicIds[source] === 'string' && (topicIds[source] as string).trim())
    || !['production', 'preview'].includes(env.SUBSCRIBE_ENVIRONMENT || '')) {
    logSubscribe('subscribe_unavailable', { reason: 'missing_configuration' })
    return errorResponse(origin, 'service_unavailable', 503)
  }

  if (!(await env.SUBSCRIBE.limit({ key: clientAddress(request) })).success) {
    logSubscribe('subscribe_limited')
    return errorResponse(origin, 'rate_limited', 429, { 'Retry-After': '60' })
  }

  if (!request.headers.get('Content-Type')?.startsWith('application/json')) {
    return errorResponse(origin, 'invalid_request', 415)
  }

  let body: unknown
  try {
    body = JSON.parse(await boundedText(request, SUBSCRIBE_MAX_BODY_BYTES))
  } catch {
    return errorResponse(origin, 'invalid_request', 400)
  }

  const payload = readObject(body)
  const address = normalizeAddress(payload?.address)
  const source = payload?.source
  if (!address || !isSubscribeSource(source) || sourceForOrigin(origin) !== source) {
    return errorResponse(origin, 'invalid_request', 400)
  }

  const budget = { requestMs: options.timeoutMs ?? SUBSCRIBE_TIMEOUT_MS, deadline: Date.now() + SUBSCRIBE_TOTAL_TIMEOUT_MS }
  const templateId = env.RESEND_WELCOME_TEMPLATE_ID?.trim()
  const from = env.RESEND_WELCOME_FROM?.trim()
  const unsubscribeSecret = env.RESEND_UNSUBSCRIBE_SECRET?.trim()
  const welcome = env.SUBSCRIBE_ENVIRONMENT === 'production' && templateId && from && unsubscribeSecret && unsubscribeSecret.length >= 32
    ? { templateId, from, source, unsubscribeSecret, waitUntil: options.waitUntil } : undefined
  try {
    const result = await subscribeWithResend(fetchImpl, apiKey, address, segmentId, topicIds[source] as string, budget, welcome)
    if (result === 'ok') return json(origin, { ok: true }, 200)
    if (result === 'suppressed') {
      logSubscribe('subscribe_rejected', { reason: 'suppressed', source })
      return errorResponse(origin, 'subscription_unavailable', 409)
    }
    logSubscribe('subscribe_unavailable', { reason: result, source })
    return errorResponse(origin, 'service_unavailable', 503)
  } catch (error) {
    const reason = isTimeout(error) ? 'timeout' : 'provider'
    logSubscribe('subscribe_unavailable', { reason, source })
    return errorResponse(origin, 'service_unavailable', 503)
  }
}
