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
})

describe('Contact options', () => {
  it('offers email and LinkedIn destinations', () => {
    renderContact()
    expect(screen.getByRole('link', { name: siteConfig.email })).toHaveAttribute('href', `mailto:${siteConfig.email}`)
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', siteConfig.social.linkedin)
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
