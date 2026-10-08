import { act, renderHook } from '@testing-library/react'
import { createElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useReducedMotion } from './useReducedMotion'

describe('useReducedMotion', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('returns true when user prefers reduced motion', () => {
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('returns false when no motion preference', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })

  it.each([true, false])('hydrates SSR with motion preference %s and follows changes', async preference => {
    const browserWindow = window
    let matches = preference
    let listener: (() => void) | undefined
    vi.mocked(window.matchMedia).mockImplementation(query => ({
      get matches() { return matches },
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (_event, callback) => { listener = callback as () => void },
      removeEventListener: () => { listener = undefined },
      dispatchEvent: vi.fn(),
    }))
    function Motion() {
      return createElement('div', null, useReducedMotion() ? 'Still' : createElement('span', null, 'Animated'))
    }
    let html: string
    vi.stubGlobal('window', undefined)
    try {
      html = renderToString(createElement(Motion))
    } finally {
      vi.stubGlobal('window', browserWindow)
    }
    const container = document.createElement('div')
    container.innerHTML = html
    const original = container.firstChild
    const errors: unknown[] = []
    let root: ReturnType<typeof hydrateRoot> | undefined
    try {
      await act(async () => {
        root = hydrateRoot(container, createElement(Motion), { onRecoverableError: error => errors.push(error) })
      })
      expect(errors).toEqual([])
      expect(container.firstChild).toBe(original)
      expect(container.textContent).toBe(preference ? 'Still' : 'Animated')
      act(() => { matches = !matches; listener?.() })
      expect(container.textContent).toBe(preference ? 'Animated' : 'Still')
    } finally {
      await act(async () => root?.unmount())
    }
    expect(listener).toBeUndefined()
  })
})
