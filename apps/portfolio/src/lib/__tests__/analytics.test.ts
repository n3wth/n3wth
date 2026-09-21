import { beforeEach, describe, expect, it, vi } from 'vitest'

const captureNewsletterSubscribed = vi.fn()
const captureSiteEvent = vi.fn()

vi.mock('@n3wth/site-config/analytics', () => ({
  captureNewsletterSubscribed,
  captureSiteEvent,
}))

const posthog = { capture: vi.fn() }

vi.mock('posthog-js', () => ({
  default: posthog,
}))

describe('portfolio analytics signup contract', () => {
  beforeEach(() => {
    vi.resetModules()
    captureNewsletterSubscribed.mockReset()
    captureSiteEvent.mockReset()
    posthog.capture.mockReset()
  })

  it('records source site only and never forwards the address', async () => {
    const { trackSignup, flushAnalytics } = await import('../analytics')
    flushAnalytics()
    trackSignup()
    await vi.waitFor(() => {
      expect(captureNewsletterSubscribed).toHaveBeenCalledWith(posthog, 'home')
    })
    expect(captureNewsletterSubscribed).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(captureNewsletterSubscribed.mock.calls)).not.toMatch(/@/)
  })

  it('does not throw when the capture helper fails', async () => {
    captureNewsletterSubscribed.mockImplementation(() => {
      throw new Error('posthog down')
    })
    const { trackSignup, flushAnalytics } = await import('../analytics')
    flushAnalytics()
    expect(() => trackSignup()).not.toThrow()
  })
})
