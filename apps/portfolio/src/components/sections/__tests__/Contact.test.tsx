import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LinkProvider } from '@n3wth/ui/primitives'
import { Contact } from '../Contact'
import { siteConfig } from '../../../data/content'
import { track } from '../../../lib/analytics'
import { RouterLink } from '../../RouterLink'

vi.mock('@n3wth/ui/visuals', () => ({ ConvergeLight: () => null, VisualBand: ({ children }: { children: ReactNode }) => <div>{children}</div> }))
vi.mock('../../../lib/analytics', () => ({ track: vi.fn() }))
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')

function renderContact() {
  return render(
    <MemoryRouter>
      <LinkProvider component={RouterLink}>
        <Contact />
      </LinkProvider>
    </MemoryRouter>,
  )
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.clearAllMocks()
  if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
  else Reflect.deleteProperty(navigator, 'clipboard')
})

describe('Contact options', () => {
  it('offers email and LinkedIn destinations', () => {
    renderContact()
    expect(screen.getByRole('link', { name: siteConfig.email })).toHaveAttribute('href', `mailto:${siteConfig.email}`)
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', siteConfig.social.linkedin)
  })

  it('copies the configured address and announces success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    renderContact()
    fireEvent.click(screen.getByRole('button', { name: 'Copy email' }))

    expect(await screen.findByText('Email copied.')).toHaveAttribute('role', 'status')
    expect(writeText).toHaveBeenCalledWith(siteConfig.email)
    expect(track).toHaveBeenNthCalledWith(1, 'contact_intent', { source_page: '/contact', method: 'copy' })
    expect(track).toHaveBeenNthCalledWith(2, 'contact_copy_succeeded', { source_page: '/contact', method: 'copy' })
    expect(track).toHaveBeenCalledTimes(2)
  })

  it('provides a manual fallback when clipboard permission is denied', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Permission denied'))
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    renderContact()
    fireEvent.click(screen.getByRole('button', { name: 'Copy email' }))

    expect(await screen.findByText(`Could not copy. Select the address above: ${siteConfig.email}`)).toHaveAttribute('role', 'status')
    expect(track).toHaveBeenNthCalledWith(1, 'contact_intent', { source_page: '/contact', method: 'copy' })
    expect(track).toHaveBeenNthCalledWith(2, 'contact_copy_failed', { source_page: '/contact', method: 'copy' })
    expect(track).toHaveBeenCalledTimes(2)
  })

  it('tracks each pointer activation once while preserving external links', () => {
    renderContact()

    const email = screen.getByRole('link', { name: siteConfig.email })
    const linkedIn = screen.getByRole('link', { name: 'LinkedIn' })
    fireEvent.click(email)
    fireEvent.click(linkedIn)

    expect(track).toHaveBeenNthCalledWith(1, 'contact_intent', { source_page: '/contact', method: 'email' })
    expect(track).toHaveBeenNthCalledWith(2, 'contact_intent', { source_page: '/contact', method: 'linkedin' })
    expect(track).toHaveBeenCalledTimes(2)
  })
})
