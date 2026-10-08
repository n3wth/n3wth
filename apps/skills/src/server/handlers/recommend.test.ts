// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
import { generateObject } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { getWorkerEnv } from '../auth/auth'
import { POST } from '../../../app/api/recommend/route'

vi.mock('ai', () => ({ generateObject: vi.fn() }))
vi.mock('@ai-sdk/google', () => ({ createGoogleGenerativeAI: vi.fn(() => vi.fn()) }))
vi.mock('../auth/auth', () => ({ getWorkerEnv: vi.fn() }))

const request = (query: unknown, origin = 'https://skills.n3wth.com') => new Request('https://skills.n3wth.com/api/recommend', {
  method: 'POST', headers: { origin }, body: JSON.stringify({ query }),
})
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getWorkerEnv).mockResolvedValue({ GOOGLE_GENERATIVE_AI_API_KEY: 'worker-secret' })
})

it('rejects hostile origins and oversized queries without calling AI', async () => {
  expect((await POST(request('pdf', 'https://evil.example'))).status).toBe(403)
  expect((await POST(request('x'.repeat(2001)))).status).toBe(400)
  expect(await (await POST(request('a'))).json()).toEqual({ recommendations: [] })
  expect(generateObject).not.toHaveBeenCalled()
})

it('reads Worker credentials and rejects hallucinated catalog IDs', async () => {
  vi.mocked(generateObject).mockResolvedValue({ object: { recommendations: [
    { skillId: 'pdf', reason: 'Read PDFs' }, { skillId: 'nonexistent', reason: 'Invented' },
  ] } } as never)
  expect(await (await POST(request('Read a PDF'))).json()).toEqual({ recommendations: [{ skillId: 'pdf', reason: 'Read PDFs' }] })
  expect(createGoogleGenerativeAI).toHaveBeenCalledWith({ apiKey: 'worker-secret' })
})

it('returns safe fallbacks for missing configuration and upstream failures', async () => {
  vi.mocked(getWorkerEnv).mockResolvedValue({})
  expect((await POST(request('Read a PDF'))).status).toBe(503)
  vi.mocked(getWorkerEnv).mockResolvedValue({ GEMINI_API_KEY: 'worker-secret' })
  vi.mocked(generateObject).mockRejectedValue(new Error('private provider details'))
  const failed = await POST(request('Read a PDF'))
  expect(failed.status).toBe(502)
  expect(await failed.json()).toEqual({ recommendations: [] })
})
