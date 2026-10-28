import { act, renderHook } from '@testing-library/react'
import { createElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMediaQuery, useIsMobile, BREAKPOINTS } from './useMediaQuery'
import { usePrefersHighContrast } from './useReducedMotion'

describe('useMediaQuery', () => {
  beforeEach(() => {
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
  })

  it('returns false by default', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it('returns true when query matches', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(true)
  })
})

describe('useIsMobile', () => {
  it('returns a boolean', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    const { result } = renderHook(() => useIsMobile())
    expect(typeof result.current).toBe('boolean')
  })
})

describe('BREAKPOINTS', () => {
  it('has expected breakpoint values', () => {
    expect(BREAKPOINTS.sm).toBeDefined()
    expect(BREAKPOINTS.md).toBeDefined()
    expect(BREAKPOINTS.lg).toBeDefined()
  })
})

describe('media query hydration', () => {
  it.each([
    ['media', false, true],
    ['media', true, false],
    ['contrast', false, true],
    ['contrast', false, false],
  ] as const)('hydrates %s with server value %s and browser value %s', async (kind, serverValue, browserValue) => {
    const browserWindow = window
    let matches = browserValue
    const listeners = new Set<() => void>()
    Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: vi.fn((query: string) => ({
      get matches() { return matches },
      media: query,
      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
    })) })
    function MediaQuery() {
      return createElement('div', null, useMediaQuery('(min-width: 768px)', serverValue) ? 'yes' : 'no')
    }
    function Contrast() {
      return createElement('div', null, usePrefersHighContrast() ? 'yes' : 'no')
    }
    const Query = kind === 'contrast' ? Contrast : MediaQuery
    let html: string
    vi.stubGlobal('window', undefined)
    try {
      html = renderToString(createElement(Query))
    } finally {
      vi.stubGlobal('window', browserWindow)
    }
    const container = document.createElement('div')
    container.innerHTML = html
    const original = container.firstChild
    const errors: unknown[] = []
    let root: ReturnType<typeof hydrateRoot> | undefined
    try {
      await act(async () => { root = hydrateRoot(container, createElement(Query), { onRecoverableError: error => errors.push(error) }) })
      expect(errors).toEqual([])
      expect(container.firstChild).toBe(original)
      expect(container.textContent).toBe(browserValue ? 'yes' : 'no')
      act(() => { matches = !matches; listeners.forEach(listener => listener()) })
      expect(container.textContent).toBe(browserValue ? 'no' : 'yes')
    } finally {
      await act(async () => root?.unmount())
      vi.unstubAllGlobals()
    }
    expect(listeners.size).toBe(0)
  })

  it('switches subscriptions when the query changes and cleans up', () => {
    const states = new Map([
      ['first', { matches: false, listeners: new Set<() => void>() }],
      ['second', { matches: true, listeners: new Set<() => void>() }],
    ])
    Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: vi.fn((query: string) => {
      const state = states.get(query)!
      return {
        get matches() { return state.matches },
        addEventListener: (_type: string, listener: () => void) => state.listeners.add(listener),
        removeEventListener: (_type: string, listener: () => void) => state.listeners.delete(listener),
      }
    }) })
    const { result, rerender, unmount } = renderHook(({ query, fallback }) => useMediaQuery(query, fallback), {
      initialProps: { query: 'first', fallback: false },
    })
    expect(result.current).toBe(false)
    expect(states.get('first')!.listeners.size).toBe(1)
    rerender({ query: 'second', fallback: true })
    expect(result.current).toBe(true)
    expect(states.get('first')!.listeners.size).toBe(0)
    expect(states.get('second')!.listeners.size).toBe(1)
    act(() => {
      const state = states.get('second')!
      state.matches = false
      state.listeners.forEach(listener => listener())
    })
    expect(result.current).toBe(false)
    rerender({ query: 'second', fallback: false })
    expect(states.get('second')!.listeners.size).toBe(1)
    unmount()
    expect(states.get('second')!.listeners.size).toBe(0)
  })
})
