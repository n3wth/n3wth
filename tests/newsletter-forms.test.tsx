import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Footer as PortfolioFooter } from '../apps/portfolio/src/components/Footer'
import { Footer as SkillsFooter } from '../apps/skills/src/components/Footer'
import { FooterSignup as R3Footer } from '../apps/r3-web/components/FooterSignup'
import { Signup as UiFooter } from '../apps/ui-docs/demo/Signup'

const { capture, trackSignup } = vi.hoisted(() => ({ capture: vi.fn(), trackSignup: vi.fn() }))
vi.mock('@n3wth/site-config/analytics', () => ({ captureNewsletterSubscribed: capture }))
vi.mock('../apps/portfolio/src/lib/analytics', () => ({ trackSignup, trackOutbound: vi.fn() }))
vi.mock('next/navigation', () => ({ usePathname: () => '/notes' }))
vi.mock('posthog-js', () => ({ default: {} }))

beforeEach(() => {
  vi.stubEnv('VITE_SUBSCRIBE_ENDPOINT', 'http://localhost/api/subscribe')
  vi.stubEnv('NEXT_PUBLIC_SUBSCRIBE_ENDPOINT', 'http://localhost/api/subscribe')
  vi.clearAllMocks()
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs() })

for (const [source, Form] of [
  ['home', PortfolioFooter], ['skills', SkillsFooter], ['r3', R3Footer], ['ui', UiFooter],
] as const) {
  describe(`${source} newsletter form`, () => {
    it('waits for confirmed API success before showing success or capturing analytics', async () => {
      let complete!: (value: Response) => void
      const request = vi.fn<typeof fetch>(() => new Promise<Response>(resolve => { complete = resolve }))
      vi.stubGlobal('fetch', request)
      render(<Form />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'reader@example.com' } })
      fireEvent.submit(screen.getByRole('button', { name: 'Subscribe' }).closest('form')!)
      expect(screen.getByRole('button', { name: 'Subscribe' })).toBeDisabled()
      expect(screen.queryByText('Thanks. You are on the list.')).toBeNull()
      expect(capture).not.toHaveBeenCalled()
      expect(trackSignup).not.toHaveBeenCalled()
      expect(JSON.parse(request.mock.calls[0][1]!.body as string)).toEqual({ address: 'reader@example.com', source })
      await act(async () => { complete(Response.json({ ok: true })) })
      expect(screen.getByText('Thanks. You are on the list.')).toBeInTheDocument()
      if (source === 'home') expect(trackSignup).toHaveBeenCalledOnce()
      else expect(capture).toHaveBeenCalledWith({}, source)
    })

    it('preserves suppression feedback, retains the address and supports retry', async () => {
      const request = vi.fn()
        .mockResolvedValueOnce(Response.json({ ok: false, code: 'subscription_unavailable' }, { status: 409 }))
        .mockResolvedValueOnce(Response.json({ ok: true }))
      vi.stubGlobal('fetch', request)
      render(<Form />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'reader@example.com' } })
      await act(async () => { fireEvent.submit(screen.getByRole('button', { name: 'Subscribe' }).closest('form')!) })
      expect(screen.getByText('We could not subscribe this address. Contact hey@n3wth.com for help.')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveValue('reader@example.com')
      expect(screen.getByRole('button', { name: 'Subscribe' })).toBeEnabled()
      expect(capture).not.toHaveBeenCalled()
      expect(trackSignup).not.toHaveBeenCalled()
      await act(async () => { fireEvent.submit(screen.getByRole('button', { name: 'Subscribe' }).closest('form')!) })
      expect(screen.getByText('Thanks. You are on the list.')).toBeInTheDocument()
      expect(request).toHaveBeenCalledTimes(2)
    })
  })
}
