import { describe, expect, it, vi } from 'vitest'
import worker from '../worker'

describe('asset cache policy', () => {
  const env = { ASSETS: { fetch: vi.fn(async () => new Response('asset')) } }

  it.each([
    ['/fonts/Geist-Regular.woff2', 'public, max-age=0, must-revalidate'],
    ['/assets/image.png', 'public, max-age=0, must-revalidate'],
    ['/_astro/SiteLayout.e_ph6K09.css', 'public, max-age=31536000, immutable'],
  ])('sets the cache policy for %s', async (path, policy) => {
    const response = await worker.fetch(new Request(`https://n3wth.com${path}`), env)
    expect(response.headers.get('cache-control')).toBe(policy)
  })
})
