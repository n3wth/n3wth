// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
import { tryGetDatabase } from '../db/d1'
import { getAnalytics, getAnalyticsSummary, recordAnalytics } from '../repositories/usage'
import { GET, POST } from '../../../app/api/analytics/route'

vi.mock('../db/d1', () => ({ tryGetDatabase: vi.fn() }))
vi.mock('../repositories/usage', () => ({ getAnalytics: vi.fn(), getAnalyticsSummary: vi.fn(), recordAnalytics: vi.fn() }))
const request = (body: unknown) => new Request('https://skills.n3wth.com/api/analytics', { method: 'POST', body: JSON.stringify(body) })
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(tryGetDatabase).mockResolvedValue({} as never)
})

it('stores supported events for real skills and rejects malformed traffic', async () => {
  expect((await POST(request({ skillId: 'pdf', eventType: 'copy' }))).status).toBe(200)
  expect(recordAnalytics).toHaveBeenCalledWith({}, 'pdf', 'copy')
  expect((await POST(request({ skillId: 'unknown', eventType: 'copy' }))).status).toBe(400)
  expect((await POST(request({ skillId: 'pdf', eventType: 'unknown' }))).status).toBe(400)
  expect(recordAnalytics).toHaveBeenCalledTimes(1)
})

it('keeps single-skill counts and catalog analytics response contracts', async () => {
  vi.mocked(getAnalyticsSummary).mockResolvedValue({ skill_id: 'pdf', views: 2, copies: 1 })
  expect(await (await GET(new Request('https://skills.n3wth.com/api/analytics?skillId=pdf'))).json()).toEqual({ views: 2, copies: 1 })
  vi.mocked(getAnalytics).mockResolvedValue([{ skill_id: 'pdf', views: 2, copies: 1 }, { skill_id: 'unknown', views: 8, copies: 4 }])
  expect(await (await GET(new Request('https://skills.n3wth.com/api/analytics'))).json()).toEqual([{ skill_id: 'pdf', views: 2, copies: 1 }])
})

it('fails explicitly without storage', async () => {
  vi.mocked(tryGetDatabase).mockResolvedValue(null)
  expect((await GET(new Request('https://skills.n3wth.com/api/analytics'))).status).toBe(503)
  expect((await POST(request({ skillId: 'pdf', eventType: 'view' }))).status).toBe(503)
})
