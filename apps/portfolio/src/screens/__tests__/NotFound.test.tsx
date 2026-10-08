import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import NotFound from '../NotFound'

const track = vi.hoisted(() => vi.fn())
vi.mock('../../lib/analytics', () => ({ track }))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('NotFound recovery', () => {
  it('tracks one view in StrictMode', () => {
    render(<StrictMode><NotFound /></StrictMode>)
    expect(track).toHaveBeenCalledExactlyOnceWith('not_found_viewed', { source_page: '/404' })
  })

  it.each([
    ['Go home', 'home', '/'],
    ['View work', 'work', '/work'],
    ['Contact', 'contact', '/contact'],
  ] as const)('links to %s and tracks recovery', (label, destination, path) => {
    render(<StrictMode><NotFound /></StrictMode>)
    const link = screen.getByRole('link', { name: label })
    expect(link).toHaveAttribute('href', path)
    fireEvent.click(link)
    expect(track.mock.calls).toEqual([
      ['not_found_viewed', { source_page: '/404' }],
      ['not_found_recovery_clicked', { source_page: '/404', destination }],
    ])
  })

  it('tracks each new document mount', () => {
    const first = render(<NotFound />)
    first.unmount()
    render(<NotFound />)
    expect(track.mock.calls).toEqual([
      ['not_found_viewed', { source_page: '/404' }],
      ['not_found_viewed', { source_page: '/404' }],
    ])
  })
})
