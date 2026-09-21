/**
 * POST /api/subscribe
 *
 * Body: { address: string, source: 'home' | 'skills' | 'garden' | 'r3' | 'ui' }
 * Success: 200 { ok: true } after Resend confirms an active contact in the segment.
 * Errors: 400 invalid_request, 403 forbidden, 409 suppressed, 429 rate_limited, 503 unavailable.
 * CORS: exact allowed Origin only. Responses are Cache-Control: no-store.
 */
import { siteUrls } from '@n3wth/site-config'

export const SUBSCRIBE_PATH = '/api/subscribe'
export const SUBSCRIBE_MAX_BODY_BYTES = 2048
export const SUBSCRIBE_TIMEOUT_MS = 4000
export const SUBSCRIBE_SOURCES = ['home', 'skills', 'garden', 'r3', 'ui'] as const
export type NewsletterSource = (typeof SUBSCRIBE_SOURCES)[number]

const RESEND_API = 'https://api.resend.com'
const ADDRESS_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PREVIEW_ORIGIN = /^https:\/\/(portfolio|skills|garden|r3-web|ui-docs)-pr-[1-9]\d{0,8}\.preview\.n3wth\.com$/
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
  SUBSCRIBE?: RateLimiter
}

type FetchImplementation = typeof fetch

interface SubscribeOptions {
  timeoutMs?: number
}

type SubscribeError = 'invalid_request' | 'forbidden' | 'rate_limited' | 'suppressed' | 'unavailable'
type ProviderResult = 'ok' | 'suppressed' | 'timeout' | 'provider' | 'partial'

function isSubscribeSource(value: unknown): value is NewsletterSource {
  return typeof value === 'string' && (SUBSCRIBE_SOURCES as readonly string[]).includes(value)
}

export function allowedSubscribeOrigin(origin: string): boolean {
  return Object.values(PRODUCTION_ORIGINS).includes(origin) || PREVIEW_ORIGIN.test(origin)
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
  const response = json(origin, { error }, status)
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
  timeoutMs: number,
): Promise<Response> {
  return fetchImpl(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
    signal: AbortSignal.timeout(timeoutMs),
  })
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
  timeoutMs: number,
): Promise<ProviderResult> {
  const contactResponse = await resend(fetchImpl, apiKey, resendPath('contacts', address), { method: 'GET' }, timeoutMs)
  if (!contactResponse.ok) return 'partial'
  const contact = await readJson(contactResponse)
  if (isUnsubscribed(contact)) return 'suppressed'
  const id = contactId(contact)
  if (!id) return 'partial'
  const segmentsResponse = await resend(fetchImpl, apiKey, resendPath('contacts', id, '/segments'), { method: 'GET' }, timeoutMs)
  if (!segmentsResponse.ok) return 'partial'
  return segmentIds(await readJson(segmentsResponse)).includes(segmentId) ? 'ok' : 'partial'
}

async function addToSegment(
  fetchImpl: FetchImplementation,
  apiKey: string,
  identity: string,
  segmentId: string,
  timeoutMs: number,
): Promise<boolean> {
  const response = await resend(
    fetchImpl,
    apiKey,
    resendPath('contacts', identity, `/segments/${encodeURIComponent(segmentId)}`),
    { method: 'POST' },
    timeoutMs,
  )
  return response.ok || response.status === 409
}

async function subscribeWithResend(
  fetchImpl: FetchImplementation,
  apiKey: string,
  address: string,
  segmentId: string,
  timeoutMs: number,
): Promise<ProviderResult> {
  const suppression = await resend(fetchImpl, apiKey, resendPath('suppressions', address), { method: 'GET' }, timeoutMs)
  if (suppression.ok) return 'suppressed'
  if (suppression.status !== 404) return 'provider'

  const existing = await resend(fetchImpl, apiKey, resendPath('contacts', address), { method: 'GET' }, timeoutMs)
  if (existing.ok) {
    const contact = await readJson(existing)
    if (isUnsubscribed(contact)) return 'suppressed'
    const id = contactId(contact) ?? address
    const segmentsResponse = await resend(fetchImpl, apiKey, resendPath('contacts', id, '/segments'), { method: 'GET' }, timeoutMs)
    if (segmentsResponse.ok && segmentIds(await readJson(segmentsResponse)).includes(segmentId)) {
      return confirmMembership(fetchImpl, apiKey, address, segmentId, timeoutMs)
    }
    if (!await addToSegment(fetchImpl, apiKey, id, segmentId, timeoutMs)) return 'provider'
    return confirmMembership(fetchImpl, apiKey, address, segmentId, timeoutMs)
  }
  if (existing.status !== 404) return 'provider'

  const created = await resend(fetchImpl, apiKey, `${RESEND_API}/contacts`, {
    method: 'POST',
    body: JSON.stringify({ email: address, unsubscribed: false, segments: [{ id: segmentId }] }),
  }, timeoutMs)
  if (!created.ok && created.status !== 409) return 'provider'
  const confirmed = await confirmMembership(fetchImpl, apiKey, address, segmentId, timeoutMs)
  if (confirmed !== 'partial') return confirmed
  if (!await addToSegment(fetchImpl, apiKey, address, segmentId, timeoutMs)) return 'partial'
  return confirmMembership(fetchImpl, apiKey, address, segmentId, timeoutMs)
}

export async function handleSubscribe(
  request: Request,
  env: SubscribeEnv = {},
  fetchImpl: FetchImplementation = fetch,
  options: SubscribeOptions = {},
): Promise<Response> {
  const origin = request.headers.get('Origin') ?? ''
  if (!allowedSubscribeOrigin(origin)) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) })
  if (request.method !== 'POST') return errorResponse(origin, 'invalid_request', 405)

  const apiKey = env.RESEND_API_KEY?.trim()
  const segmentId = env.RESEND_SEGMENT_ID?.trim()
  if (!apiKey || !segmentId || !env.SUBSCRIBE) {
    logSubscribe('subscribe_unavailable', { reason: 'missing_configuration' })
    return errorResponse(origin, 'unavailable', 503)
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

  const timeoutMs = options.timeoutMs ?? SUBSCRIBE_TIMEOUT_MS
  try {
    const result = await subscribeWithResend(fetchImpl, apiKey, address, segmentId, timeoutMs)
    if (result === 'ok') return json(origin, { ok: true }, 200)
    if (result === 'suppressed') {
      logSubscribe('subscribe_rejected', { reason: 'suppressed', source })
      return errorResponse(origin, 'suppressed', 409)
    }
    logSubscribe('subscribe_unavailable', { reason: result, source })
    return errorResponse(origin, 'unavailable', 503)
  } catch (error) {
    const reason = isTimeout(error) ? 'timeout' : 'provider'
    logSubscribe('subscribe_unavailable', { reason, source })
    return errorResponse(origin, 'unavailable', 503)
  }
}
