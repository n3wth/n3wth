import { describe, expect, it, vi } from 'vitest'
import worker from '../worker'

describe('retired Skills domain', () => {
  const env = { ASSETS: { fetch: vi.fn() } }

  it.each(['GET', 'POST', 'DELETE', 'OPTIONS'])('returns 410 for %s API requests without touching storage', async method => {
    const response = await worker.fetch(new Request('https://skills.n3wth.com/api/auth/session', { method }), env)
    expect(response.status).toBe(410)
    expect(await response.json()).toEqual({ error: 'service_retired' })
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(env.ASSETS.fetch).not.toHaveBeenCalled()
  })

  it.each([
    ['/install.sh', '/skills/install.sh'],
    ['/', '/docs/skills'],
    ['/playground', '/docs/skills'],
  ])('redirects %s to %s', async (path, destination) => {
    const response = await worker.fetch(new Request(`https://skills.n3wth.com${path}`), env)
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(`https://n3wth.com${destination}`)
  })
})
