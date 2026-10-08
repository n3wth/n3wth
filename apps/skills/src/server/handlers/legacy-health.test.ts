// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { GET } from '../../../app/api/health/supabase/route'

const fetchMock = vi.fn()
beforeEach(() => {
  vi.resetAllMocks()
  vi.stubGlobal('fetch', fetchMock)
  for (const key of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SKILLS_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SKILLS_SUPABASE_ANON_KEY']) vi.stubEnv(key, '')
})
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })

it('keeps the explicit legacy diagnostic unavailable without configuration', async () => {
  expect((await GET()).status).toBe(503)
  expect(fetchMock).not.toHaveBeenCalled()
})

it('probes legacy tables without downloading records', async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://legacy.example/')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'public-anon-key')
  fetchMock.mockImplementation(async () => new Response(null, { status: 200 }))
  const response = await GET()
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ ok: true, tables: { upvotes: { ok: true }, comments: { ok: true }, profiles: { ok: true } } })
  expect(fetchMock).toHaveBeenCalledTimes(3)
  expect(fetchMock.mock.calls.every(call => call[1].method === 'HEAD')).toBe(true)
})

it('returns safe failed-table diagnostics for errors and timeouts', async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://legacy.example')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'public-anon-key')
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 })).mockRejectedValue(new Error('private details'))
  const response = await GET()
  expect(response.status).toBe(503)
  expect(await response.json()).toMatchObject({ ok: false, tables: { upvotes: { ok: false, error: 'HTTP 404' }, comments: { ok: false, error: 'Connection failed' } } })
})
