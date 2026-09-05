import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Nav } from '../Nav'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderNav(path = '/') {
  const onOpenSearch = vi.fn()
  render(
    <MemoryRouter initialEntries={[path]}>
      <Nav onOpenSearch={onOpenSearch} />
    </MemoryRouter>
  )
  return { trigger: screen.getByRole('button', { name: 'Primary' }), onOpenSearch }
}

describe('Navigation disclosure', () => {
  it('toggles its expanded state and identifies the controlled navigation', () => {
    const { trigger } = renderNav()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-controls', screen.getByRole('navigation', { name: 'Primary' }).id)

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes with Escape from a navigation link and restores trigger focus', () => {
    const { trigger } = renderNav()
    fireEvent.click(trigger)
    const link = screen.getByRole('link', { name: 'Work' })
    link.focus()
    fireEvent.keyDown(link, { key: 'Escape' })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it.each(['/', '/work'])('closes when selecting Work from %s', (path) => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const { trigger } = renderNav(path)
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('link', { name: 'Work' }))

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page')
  })

  it('closes before handing off to site search', () => {
    const { trigger, onOpenSearch } = renderNav()
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(onOpenSearch).toHaveBeenCalledOnce()
  })
})
