// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getWorkerEnv } from '../auth/auth'
import { consumePlaygroundQuota, consumeWorkflowQuota } from '../repositories/usage'
import { POST as playground } from '../../../app/api/playground/route'
import { POST as workflow } from '../../../app/api/ai/execute/route'

vi.mock('../auth/auth', () => ({ getWorkerEnv: vi.fn() }))
vi.mock('../repositories/usage', () => ({ consumePlaygroundQuota: vi.fn(), consumeWorkflowQuota: vi.fn() }))

const fetchMock = vi.fn()
const request = (body: unknown, origin = 'https://skills.n3wth.com') => new Request('https://skills.n3wth.com/api/playground', {
  method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
})
const input = { prompt: 'Summarize this document', fingerprint: 'browser-1' }

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubGlobal('fetch', fetchMock)
  vi.mocked(getWorkerEnv).mockResolvedValue({ GEMINI_API_KEY: 'server-key', DB: {} as never })
  vi.mocked(consumePlaygroundQuota).mockResolvedValue({ allowed: true, remaining: 2, used: 1, limit: 3 })
  vi.mocked(consumeWorkflowQuota).mockResolvedValue({ allowed: true, remaining: 1, used: 2, limit: 3 })
  fetchMock.mockImplementation(async () => Response.json({ candidates: [{ content: { parts: [{ text: 'Output' }] } }] }))
})
afterEach(() => vi.unstubAllGlobals())

describe('AI routes', () => {
  it('rejects hostile origins and invalid payloads before consuming quota', async () => {
    expect((await playground(request(input, 'https://evil.example'))).status).toBe(403)
    expect((await playground(request({ prompt: 'hello' }))).status).toBe(400)
    expect((await playground(new Request('https://skills.n3wth.com/api/playground', { method: 'POST', body: '{' }))).status).toBe(400)
    expect(consumePlaygroundQuota).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('uses the correct independent quota and returns the client result contract', async () => {
    expect(await (await playground(request(input))).json()).toMatchObject({ result: 'Output', remaining: 2 })
    expect(await (await workflow(request(input))).json()).toMatchObject({ result: 'Output', remaining: 1 })
    expect(consumePlaygroundQuota).toHaveBeenCalledWith({}, 'browser-1')
    expect(consumeWorkflowQuota).toHaveBeenCalledWith({}, 'browser-1')
    expect(fetchMock.mock.calls[0][0]).not.toContain('server-key')
    expect(fetchMock.mock.calls[0][1].headers['x-goog-api-key']).toBe('server-key')
  })

  it('fails closed when free usage storage or credentials are unavailable', async () => {
    vi.mocked(getWorkerEnv).mockResolvedValue({ GEMINI_API_KEY: 'server-key' })
    expect((await playground(request(input))).status).toBe(503)
    vi.mocked(getWorkerEnv).mockResolvedValue({})
    expect((await playground(request(input))).status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('accepts the existing Cloudflare Google secret for built-in requests', async () => {
    vi.mocked(getWorkerEnv).mockResolvedValue({ GOOGLE_GENERATIVE_AI_API_KEY: 'google-key', DB: {} as never })
    expect((await playground(request(input))).status).toBe(200)
    expect(fetchMock.mock.calls[0][1].headers['x-goog-api-key']).toBe('google-key')
  })

  it('denies exhausted free quota without calling the provider', async () => {
    vi.mocked(consumePlaygroundQuota).mockResolvedValue({ allowed: false, remaining: 0, used: 3, limit: 3 })
    const response = await playground(request(input))
    expect(response.status).toBe(402)
    expect(await response.json()).toMatchObject({ limit: 3, used: 3 })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('allows a user key without consuming the free quota or requiring D1', async () => {
    vi.mocked(getWorkerEnv).mockResolvedValue({})
    const response = await playground(request({ ...input, userApiKey: 'own-key' }))
    expect(await response.json()).toMatchObject({ result: 'Output' })
    expect(consumePlaygroundQuota).not.toHaveBeenCalled()
    expect(fetchMock.mock.calls[0][1].headers['x-goog-api-key']).toBe('own-key')
  })

  it('returns provider failures without disclosing upstream bodies or credentials', async () => {
    fetchMock.mockResolvedValueOnce(new Response('sensitive upstream details', { status: 403 }))
    const invalid = await playground(request(input))
    expect(invalid.status).toBe(401)
    expect(await invalid.json()).toEqual({ error: 'Invalid API key' })
    fetchMock.mockRejectedValueOnce(new Error('sensitive upstream details'))
    const failed = await playground(request(input))
    expect(failed.status).toBe(502)
    expect(await failed.json()).toEqual({ error: 'AI execution failed' })
  })
})
