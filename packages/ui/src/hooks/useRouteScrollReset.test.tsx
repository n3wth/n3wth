import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, renderHook } from '@testing-library/react'
import { useRouteScrollReset } from './useRouteScrollReset'

afterEach(() => { vi.restoreAllMocks(); document.body.innerHTML = '' })

function setup(href = '/another-page') {
  const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { callback(0); return 1 })
  const hook = renderHook(({ path }) => useRouteScrollReset(path), { initialProps: { path: '/' } })
  const link = document.createElement('a')
  link.href = href
  // The application router handles navigation; only simulate its click here.
  link.addEventListener('click', event => event.preventDefault())
  document.body.appendChild(link)
  return { scroll, link, ...hook }
}

describe('useRouteScrollReset', () => {
  it('resets an ordinary page click after the destination mounts', () => {
    const { scroll, link, rerender } = setup()
    fireEvent.click(link)
    expect(scroll).not.toHaveBeenCalled()
    rerender({ path: '/another-page' })
    expect(scroll).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
  })

  it('does not reset Back/Forward navigation', () => {
    const { scroll, link, rerender } = setup()
    fireEvent.click(link)
    fireEvent.popState(window)
    rerender({ path: '/another-page' })
    expect(scroll).not.toHaveBeenCalled()
  })

  it.each(['/another-page#heading', 'https://example.com/another-page'])('preserves hash and external navigation: %s', href => {
    const { scroll, link, rerender } = setup(href)
    fireEvent.click(link)
    rerender({ path: '/another-page' })
    expect(scroll).not.toHaveBeenCalled()
  })

  it('does not take over modified clicks', () => {
    const { scroll, link, rerender } = setup()
    fireEvent.click(link, { ctrlKey: true })
    rerender({ path: '/another-page' })
    expect(scroll).not.toHaveBeenCalled()
  })
})
