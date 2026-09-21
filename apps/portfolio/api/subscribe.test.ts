import { afterEach, describe, expect, it, vi } from 'vitest'
import { handlePortfolioApi } from './runtime'
import { SUBSCRIBE_MAX_BODY_BYTES, allowedSubscribeOrigin, sourceForOrigin, type SubscribeEnv } from './subscribe'

const ADDRESS = 'reader@example.com'
const SECRET = 're_test_secret'
const SEGMENT = 'seg_test_preview'
const ORIGIN = 'https://n3wth.com'
const TOPIC = 'topic_home'

const allow = { SUBSCRIBE: { limit: async () => ({ success: true }) } }
const deny = { SUBSCRIBE: { limit: async () => ({ success: false }) } }
const configured: SubscribeEnv = { RESEND_API_KEY: SECRET, RESEND_SEGMENT_ID: SEGMENT, RESEND_TOPIC_IDS: JSON.stringify({ home: TOPIC, skills: 'topic_skills', garden: 'topic_garden', r3: 'topic_r3', ui: 'topic_ui' }), SUBSCRIBE_ENVIRONMENT: 'production', ...allow }

function subscribeRequest(init: RequestInit & { origin?: string; url?: string } = {}) {
  const { origin = ORIGIN, url = '/api/subscribe', ...rest } = init
  const headers = new Headers(rest.headers)
  if (origin) headers.set('Origin', origin)
  if (rest.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  return new Request(url.startsWith('https://') ? url : `https://n3wth.com${url}`, { method: 'POST', ...rest, headers })
}

function body(address = ADDRESS, source = 'home') {
  return JSON.stringify({ address, source })
}

interface FakeOptions {
  suppressed?: boolean
  unsubscribed?: boolean
  existing?: boolean
  alreadyInSegment?: boolean
  createStatus?: number
  addStatus?: number
  confirmSegments?: boolean | 'empty-then-member'
  timeoutOn?: string
  failOn?: string
  topicSubscription?: string
  missingTopic?: boolean
}

function resendFake(options: FakeOptions = {}) {
  const calls: Array<{ method: string; url: string; body?: string; authorization?: string | null }> = []
  let segmentReads = 0
  const fetchMock: typeof fetch = async (input, init) => {
    const request = new Request(input, init)
    const url = request.url
    const method = request.method
    const payload = request.body ? await request.text() : undefined
    calls.push({ method, url, body: payload, authorization: request.headers.get('authorization') })
    if (url.includes(SECRET) || payload?.includes(SECRET)) throw new Error('secret leaked into fetch')
    if (options.timeoutOn && url.includes(options.timeoutOn)) {
      throw new DOMException('The operation was aborted due to timeout', 'TimeoutError')
    }
    if (options.failOn && url.includes(options.failOn)) {
      return new Response(JSON.stringify({ name: 'internal_error' }), { status: 500 })
    }
    if (url.includes('/suppressions/')) {
      return options.suppressed
        ? new Response(JSON.stringify({ object: 'suppression', id: 'sup_1' }), { status: 200 })
        : new Response(JSON.stringify({ statusCode: 404, name: 'not_found' }), { status: 404 })
    }
    if (url.endsWith('/contacts') && method === 'POST') {
      return new Response(JSON.stringify({ object: 'contact', id: 'con_1' }), { status: options.createStatus ?? 200 })
    }
    if (url.includes('/segments/') && method === 'POST') {
      return new Response(JSON.stringify({ id: SEGMENT }), { status: options.addStatus ?? 200 })
    }
    if (url.includes('/segments') && method === 'GET') {
      segmentReads += 1
      const member = options.confirmSegments === 'empty-then-member'
        ? segmentReads > 1
        : options.confirmSegments ?? options.alreadyInSegment ?? Boolean(options.createStatus === undefined && !options.existing)
      const data = member || options.alreadyInSegment ? [{ id: SEGMENT, name: 'Agent infrastructure notes' }] : []
      if (options.existing && options.alreadyInSegment) {
        return new Response(JSON.stringify({ object: 'list', data: [{ id: SEGMENT }] }), { status: 200 })
      }
      return new Response(JSON.stringify({ object: 'list', data }), { status: 200 })
    }
    if (url.includes('/topics')) {
      return Response.json({ data: options.missingTopic ? [] : [{ id: TOPIC, subscription: options.topicSubscription ?? 'opt_in' }], has_more: false })
    }
    if (url.includes('/contacts/') && method === 'GET') {
      if (!options.existing && options.createStatus === undefined && !calls.some(call => call.method === 'POST' && call.url.endsWith('/contacts'))) {
        return new Response(JSON.stringify({ statusCode: 404, name: 'not_found' }), { status: 404 })
      }
      if (!options.existing && !calls.some(call => call.method === 'POST' && call.url.endsWith('/contacts')) && options.createStatus !== 409) {
        return new Response(JSON.stringify({ statusCode: 404, name: 'not_found' }), { status: 404 })
      }
      return new Response(JSON.stringify({
        object: 'contact',
        id: 'con_1',
        email: ADDRESS,
        unsubscribed: Boolean(options.unsubscribed),
      }), { status: 200 })
    }
    return new Response(JSON.stringify({ name: 'not_found' }), { status: 404 })
  }
  return { fetchMock, calls }
}

function newContactFake() {
  const calls: Array<{ method: string; url: string; body?: string; authorization?: string | null }> = []
  let created = false
  const fetchMock: typeof fetch = async (input, init) => {
    const request = new Request(input, init)
    const url = request.url
    const payload = request.body ? await request.text() : undefined
    calls.push({ method: request.method, url, body: payload, authorization: request.headers.get('authorization') })
    if (url.includes('/suppressions/')) return new Response('{}', { status: 404 })
    if (url.endsWith('/contacts') && request.method === 'POST') {
      created = true
      return new Response(JSON.stringify({ object: 'contact', id: 'con_1' }), { status: 200 })
    }
    if (url.includes('/segments/') && request.method === 'POST') {
      return new Response(JSON.stringify({ id: SEGMENT }), { status: 200 })
    }
    if (url.includes('/segments')) {
      return new Response(JSON.stringify({ object: 'list', data: created ? [{ id: SEGMENT }] : [] }), { status: 200 })
    }
    if (url.includes('/topics')) return Response.json({ data: [{ id: TOPIC, subscription: 'opt_in' }], has_more: false })
    if (url.includes('/contacts/')) {
      if (!created) return new Response('{}', { status: 404 })
      return new Response(JSON.stringify({ object: 'contact', id: 'con_1', unsubscribed: false }), { status: 200 })
    }
    return new Response('{}', { status: 404 })
  }
  return { fetchMock, calls }
}

describe('POST /api/subscribe', () => {
  const warnings: string[] = []

  afterEach(() => {
    warnings.length = 0
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  function captureLogs() {
    vi.spyOn(console, 'warn').mockImplementation((message?: unknown) => {
      warnings.push(typeof message === 'string' ? message : JSON.stringify(message))
    })
  }

  function expectPrivacy() {
    const text = warnings.join('\n')
    expect(text).not.toContain(ADDRESS)
    expect(text).not.toContain(SECRET)
    expect(text).not.toContain('Bearer')
  }

  it('creates a contact, confirms an active member, and returns no-store success', async () => {
    captureLogs()
    const { fetchMock, calls } = newContactFake()
    const response = await handlePortfolioApi(subscribeRequest({ body: body() }), configured, fetchMock)
    expect(response?.status).toBe(200)
    expect(await response?.json()).toEqual({ ok: true })
    expect(response?.headers.get('cache-control')).toBe('no-store')
    expect(response?.headers.get('access-control-allow-origin')).toBe(ORIGIN)
    expect(response?.headers.get('access-control-allow-origin')).not.toBe('*')
    expect(calls.some(call => call.method === 'POST' && call.url === 'https://api.resend.com/contacts')).toBe(true)
    const created = calls.find(call => call.method === 'POST' && call.url.endsWith('/contacts'))
    expect(JSON.parse(created!.body!).topics).toEqual([{ id: TOPIC, subscription: 'opt_in' }])
    expect(calls.every(call => call.authorization === `Bearer ${SECRET}`)).toBe(true)
    expect(calls.every(call => !call.url.includes(SECRET))).toBe(true)
    expectPrivacy()
  })

  it('treats a repeat signup of an active member as success without recreating the contact', async () => {
    const { fetchMock, calls } = resendFake({ existing: true, alreadyInSegment: true })
    const response = await handlePortfolioApi(subscribeRequest({ body: body() }), configured, fetchMock)
    expect(response?.status).toBe(200)
    expect(await response?.json()).toEqual({ ok: true })
    expect(calls.some(call => call.method === 'POST' && call.url.endsWith('/contacts'))).toBe(false)
    expect(calls.some(call => call.method === 'POST' && call.url.includes('/segments/'))).toBe(false)
  })

  it('completes a retry after a previous create without segment membership', async () => {
    const { fetchMock, calls } = resendFake({ existing: true, alreadyInSegment: false, confirmSegments: 'empty-then-member' })
    const response = await handlePortfolioApi(subscribeRequest({ body: body() }), configured, fetchMock)
    expect(response?.status).toBe(200)
    expect(calls.some(call => call.method === 'POST' && call.url.includes('/segments/'))).toBe(true)
    expect(calls.some(call => call.method === 'POST' && call.url.endsWith('/contacts'))).toBe(false)
  })

  it('preserves suppressions and does not create or mutate the contact', async () => {
    const { fetchMock, calls } = resendFake({ suppressed: true })
    const response = await handlePortfolioApi(subscribeRequest({ body: body() }), configured, fetchMock)
    expect(response?.status).toBe(409)
    expect(await response?.json()).toEqual({ ok: false, code: 'subscription_unavailable' })
    expect(calls.some(call => call.method === 'POST')).toBe(false)
  })

  it('preserves opted-out contacts and does not clear unsubscribed', async () => {
    const { fetchMock, calls } = resendFake({ existing: true, unsubscribed: true })
    const response = await handlePortfolioApi(subscribeRequest({ body: body() }), configured, fetchMock)
    expect(response?.status).toBe(409)
    expect(await response?.json()).toEqual({ ok: false, code: 'subscription_unavailable' })
    expect(calls.some(call => call.method === 'POST')).toBe(false)
    expect(calls.some(call => call.body?.includes('"unsubscribed":false'))).toBe(false)
  })

  it('preserves topic opt-outs even when the contact is globally active', async () => {
    const { fetchMock, calls } = resendFake({ existing: true, topicSubscription: 'opt_out' })
    const response = await handlePortfolioApi(subscribeRequest({ body: body() }), configured, fetchMock)
    expect(response?.status).toBe(409)
    expect(await response?.json()).toEqual({ ok: false, code: 'subscription_unavailable' })
    expect(calls.every(call => call.method === 'GET')).toBe(true)
  })

  it('never reports success for missing topic membership or failed topic checks', async () => {
    for (const options of [{ missingTopic: true }, { failOn: '/topics' }]) {
      const { fetchMock } = resendFake({ existing: true, alreadyInSegment: true, ...options })
      const response = await handlePortfolioApi(subscribeRequest({ body: body() }), configured, fetchMock)
      expect(response?.status).toBe(503)
      expect(await response?.json()).toEqual({ ok: false, code: 'service_unavailable' })
    }
  })

  it('retries transient account rate limits without treating them as an absent suppression', async () => {
    vi.useFakeTimers()
    const { fetchMock } = resendFake({ existing: true, alreadyInSegment: true })
    let limited = 0
    const retrying: typeof fetch = async (input, init) => {
      if (limited++ < 2) return new Response('{}', { status: 429, headers: { 'retry-after': '1' } })
      return fetchMock(input, init)
    }
    const pending = handlePortfolioApi(subscribeRequest({ body: body() }), configured, retrying)
    await vi.runAllTimersAsync()
    expect((await pending)?.status).toBe(200)
  })

  it('bounds persistent account rate limits and fails closed before mutation', async () => {
    vi.useFakeTimers()
    const limited = vi.fn(async () => new Response('{}', { status: 429 }))
    const pending = handlePortfolioApi(subscribeRequest({ body: body() }), configured, limited)
    await vi.runAllTimersAsync()
    const response = await pending
    expect(response?.status).toBe(503)
    expect(limited).toHaveBeenCalledTimes(3)
  })

  it('does not retry a provider rate limit beyond the bounded wait', async () => {
    const limited = vi.fn(async () => new Response('{}', { status: 429, headers: { 'retry-after': '60' } }))
    const response = await handlePortfolioApi(subscribeRequest({ body: body() }), configured, limited)
    expect(response?.status).toBe(503)
    expect(limited).toHaveBeenCalledTimes(1)
  })

  it('does not start another provider call after the shared deadline is exhausted', async () => {
    vi.useFakeTimers()
    const started = Date.now()
    const slow = vi.fn(async () => {
      vi.setSystemTime(started + 20000)
      return new Response('{}', { status: 404 })
    })
    const response = await handlePortfolioApi(subscribeRequest({ body: body() }), configured, slow)
    expect(response?.status).toBe(503)
    expect(await response?.json()).toEqual({ ok: false, code: 'service_unavailable' })
    expect(slow).toHaveBeenCalledTimes(1)
  })

  it('rejects a retry wait that would exceed the shared deadline', async () => {
    vi.useFakeTimers()
    const started = Date.now()
    const limited = vi.fn(async () => {
      vi.setSystemTime(started + 19500)
      return new Response('{}', { status: 429, headers: { 'retry-after': '1' } })
    })
    const response = await handlePortfolioApi(subscribeRequest({ body: body() }), configured, limited)
    expect(response?.status).toBe(503)
    expect(limited).toHaveBeenCalledTimes(1)
    expect(Date.now() - started).toBeLessThan(20000)
  })

  it('rejects preview requests against production and unrelated PRs against preview', async () => {
    const provider = vi.fn(async () => Response.json({}))
    const preview = { ...configured, SUBSCRIBE_ENVIRONMENT: 'preview', SUBSCRIBE_PREVIEW_PR: '12' }
    const production = await handlePortfolioApi(subscribeRequest({ origin: 'https://portfolio-pr-12.preview.n3wth.com', body: body() }), configured, provider)
    expect(production?.status).toBe(403)
    for (const origin of [ORIGIN, 'https://portfolio-pr-13.preview.n3wth.com']) {
      const response = await handlePortfolioApi(subscribeRequest({ origin, url: 'https://portfolio-pr-12.preview.n3wth.com/api/subscribe', body: body() }), preview, provider)
      expect(response?.status).toBe(403)
    }
    expect(provider).not.toHaveBeenCalled()
  })

  it('rejects invalid addresses, sources, oversized bodies, and origin/source mismatches', async () => {
    const fetchMock: typeof fetch = async () => { throw new Error('Resend should not be called') }
    const invalid = [
      subscribeRequest({ body: JSON.stringify({ address: 'not-an-email', source: 'home' }) }),
      subscribeRequest({ body: JSON.stringify({ address: ADDRESS, source: 'other' }) }),
      subscribeRequest({ body: JSON.stringify({ source: 'home' }) }),
      subscribeRequest({ origin: 'https://skills.n3wth.com', body: body(ADDRESS, 'home') }),
      subscribeRequest({ body: `{"address":"${ADDRESS}","source":"home","pad":"${'x'.repeat(SUBSCRIBE_MAX_BODY_BYTES)}"}` }),
    ]
    for (const request of invalid) {
      const response = await handlePortfolioApi(request, configured, fetchMock)
      expect(response?.status).toBe(400)
      expect(await response?.json()).toEqual({ ok: false, code: 'invalid_request' })
    }
  })

  it('rejects unknown origins on POST and OPTIONS', async () => {
    const fetchMock: typeof fetch = async () => { throw new Error('Resend should not be called') }
    const blocked = await handlePortfolioApi(subscribeRequest({ origin: 'https://evil.example', body: body() }), configured, fetchMock)
    expect(blocked?.status).toBe(403)
    expect(blocked?.headers.get('access-control-allow-origin')).toBeNull()
    const options = await handlePortfolioApi(subscribeRequest({ method: 'OPTIONS', origin: 'https://n3wth.com.evil.example' }), configured, fetchMock)
    expect(options?.status).toBe(403)
  })

  it('answers exact-origin CORS preflight without calling Resend', async () => {
    const fetchMock: typeof fetch = async () => { throw new Error('Resend should not be called') }
    const response = await handlePortfolioApi(subscribeRequest({ method: 'OPTIONS', origin: 'https://skills.n3wth.com' }), configured, fetchMock)
    expect(response?.status).toBe(204)
    expect(response?.headers.get('access-control-allow-origin')).toBe('https://skills.n3wth.com')
    expect(response?.headers.get('access-control-allow-methods')).toBe('POST, OPTIONS')
    expect(response?.headers.get('cache-control')).toBe('no-store')
  })

  it('enforces five requests per minute per IP before talking to Resend', async () => {
    const fetchMock: typeof fetch = async () => { throw new Error('Resend should not be called') }
    const response = await handlePortfolioApi(
      subscribeRequest({ body: body(), headers: { 'CF-Connecting-IP': '203.0.113.8', 'Content-Type': 'application/json' } }),
      { ...configured, ...deny },
      fetchMock,
    )
    expect(response?.status).toBe(429)
    expect(response?.headers.get('retry-after')).toBe('60')
    expect(await response?.json()).toEqual({ ok: false, code: 'rate_limited' })
  })

  it('fails closed when the provider key, segment, or limiter is missing', async () => {
    captureLogs()
    const fetchMock: typeof fetch = async () => { throw new Error('Resend should not be called') }
    const missing = [
      { RESEND_SEGMENT_ID: SEGMENT, ...allow },
      { RESEND_API_KEY: SECRET, ...allow },
      { RESEND_API_KEY: SECRET, RESEND_SEGMENT_ID: SEGMENT },
      { ...configured, RESEND_TOPIC_IDS: undefined },
      { ...configured, RESEND_TOPIC_IDS: '{}' },
      { ...configured, SUBSCRIBE_ENVIRONMENT: undefined },
    ]
    for (const env of missing) {
      const response = await handlePortfolioApi(subscribeRequest({ body: body() }), env, fetchMock)
      expect(response?.status).toBe(503)
      expect(await response?.json()).toEqual({ ok: false, code: 'service_unavailable' })
    }
    expectPrivacy()
  })

  it('maps provider timeouts and 5xx failures to unavailable', async () => {
    captureLogs()
    const timeout = resendFake({ timeoutOn: '/suppressions/' })
    const timedOut = await handlePortfolioApi(subscribeRequest({ body: body() }), configured, timeout.fetchMock)
    expect(timedOut?.status).toBe(503)
    const failed = resendFake({ failOn: '/suppressions/' })
    const unavailable = await handlePortfolioApi(subscribeRequest({ body: body() }), configured, failed.fetchMock)
    expect(unavailable?.status).toBe(503)
    expect(await unavailable?.json()).toEqual({ ok: false, code: 'service_unavailable' })
    expectPrivacy()
  })

  it('does not report success when segment membership is not confirmed', async () => {
    captureLogs()
    const { fetchMock } = resendFake({ createStatus: 200, addStatus: 500, confirmSegments: false })
    const response = await handlePortfolioApi(subscribeRequest({ body: body() }), configured, fetchMock)
    expect(response?.status).toBe(503)
    expect(await response?.json()).toEqual({ ok: false, code: 'service_unavailable' })
    expectPrivacy()
  })

  it('separates production origins from the exact preview PR and Worker host', () => {
    expect(allowedSubscribeOrigin('https://skills.n3wth.com')).toBe(true)
    expect(allowedSubscribeOrigin('https://ui.n3wth.com')).toBe(true)
    expect(allowedSubscribeOrigin('https://garden-pr-12.preview.n3wth.com')).toBe(false)
    const preview = { SUBSCRIBE_ENVIRONMENT: 'preview', SUBSCRIBE_PREVIEW_PR: '12' }
    const target = 'https://portfolio-pr-12.preview.n3wth.com'
    expect(allowedSubscribeOrigin('https://garden-pr-12.preview.n3wth.com', preview, target)).toBe(true)
    expect(allowedSubscribeOrigin('https://garden-pr-13.preview.n3wth.com', preview, target)).toBe(false)
    expect(allowedSubscribeOrigin('https://garden.n3wth.com', preview, target)).toBe(false)
    expect(allowedSubscribeOrigin('https://garden-pr-12.preview.n3wth.com', preview, ORIGIN)).toBe(false)
    expect(allowedSubscribeOrigin('https://garden.n3wth.com.evil.example')).toBe(false)
    expect(sourceForOrigin('https://r3.n3wth.com')).toBe('r3')
    expect(sourceForOrigin('https://ui-docs-pr-3.preview.n3wth.com')).toBe('ui')
    expect(sourceForOrigin('https://portfolio-pr-3.preview.n3wth.com')).toBe('home')
  })
})
