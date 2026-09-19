import { createElement, StrictMode, Suspense } from 'react'
import { renderToString } from 'react-dom/server'
import { hydrateRoot } from 'react-dom/client'
import { renderHook, render, fireEvent, act, cleanup } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useTheme } from './useTheme'

// Mock localStorage
const storageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  }
})()

describe('useTheme', () => {
  const mediaListeners = new Set<(event: MediaQueryListEvent) => void>()
  let mediaQuery: {
    matches: boolean
    addEventListener: ReturnType<typeof vi.fn>
    removeEventListener: ReturnType<typeof vi.fn>
  }

  const changeSystemTheme = (matches: boolean) => {
    mediaQuery.matches = matches
    act(() => {
      for (const listener of mediaListeners) listener({ matches } as MediaQueryListEvent)
    })
  }

  it('still resolves and changes theme when browser storage is unavailable', () => {
    storageMock.getItem.mockImplementationOnce(() => { throw new Error('Storage denied') })
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    storageMock.setItem.mockImplementationOnce(() => { throw new Error('Storage denied') })
    act(() => result.current.setTheme('light'))
    expect(result.current.theme).toBe('light')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  })

  beforeEach(() => {
    storageMock.clear()
    vi.clearAllMocks()
    mediaListeners.clear()
    Object.defineProperty(window, 'localStorage', { value: storageMock, writable: true })
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('data-custom-theme')
    mediaQuery = {
      matches: false,
      addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
        mediaListeners.add(listener)
      }),
      removeEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
        mediaListeners.delete(listener)
      }),
    }
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue(mediaQuery),
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('returns dark theme by default', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
    expect(result.current.isLight).toBe(false)
  })

  it('respects defaultTheme option', () => {
    const { result } = renderHook(() => useTheme({ defaultTheme: 'light' }))
    expect(result.current.theme).toBe('light')
  })

  it('toggles theme', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')
    expect(result.current.isLight).toBe(true)
  })

  it('sets theme directly', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('light'))
    expect(result.current.theme).toBe('light')
  })

  it('persists theme to localStorage', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('light'))
    expect(storageMock.setItem).toHaveBeenCalledWith('n3wth-theme', 'light')
  })

  it('reads theme from localStorage', () => {
    storageMock.getItem.mockReturnValueOnce('light')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })

  it('sets data-theme attribute on document', () => {
    const { result } = renderHook(() => useTheme())
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    act(() => result.current.setTheme('light'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('uses custom storageKey', () => {
    const { result } = renderHook(() => useTheme({ storageKey: 'custom-key' }))
    act(() => result.current.setTheme('light'))
    expect(storageMock.setItem).toHaveBeenCalledWith('custom-key', 'light')
  })

  it('keeps concurrent callers synchronized in both directions', () => {
    const app = renderHook(() => useTheme())
    const section = renderHook(() => useTheme())

    act(() => app.result.current.toggleTheme())
    expect(section.result.current).toMatchObject({ theme: 'light', isDark: false, isLight: true })
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')

    act(() => section.result.current.setTheme('dark'))
    expect(app.result.current).toMatchObject({ theme: 'dark', isDark: true, isLight: false })
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('toggles from the shared current value even before a rerender', () => {
    const app = renderHook(() => useTheme())
    const section = renderHook(() => useTheme())

    act(() => {
      app.result.current.toggleTheme()
      section.result.current.toggleTheme()
    })

    expect(app.result.current.theme).toBe('dark')
    expect(section.result.current.theme).toBe('dark')
    expect(storageMock.getItem('n3wth-theme')).toBe('dark')
  })

  it('follows successive system changes without persisting a preference', () => {
    const app = renderHook(() => useTheme())
    const section = renderHook(() => useTheme())

    for (const theme of ['light', 'dark', 'light'] as const) {
      changeSystemTheme(theme === 'light')
      expect(app.result.current.theme).toBe(theme)
      expect(section.result.current.theme).toBe(theme)
      expect(document.documentElement).toHaveAttribute('data-theme', theme)
    }
    expect(storageMock.setItem).not.toHaveBeenCalled()
  })

  it('starts with the system light preference without persisting it', () => {
    mediaQuery.matches = true
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('light')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(storageMock.setItem).not.toHaveBeenCalled()
  })

  it('preserves a stored preference over initial and subsequent system changes', () => {
    storageMock.setItem('n3wth-theme', 'dark')
    mediaQuery.matches = true
    const { result } = renderHook(() => useTheme({ defaultTheme: 'light' }))

    expect(result.current.theme).toBe('dark')
    changeSystemTheme(false)
    changeSystemTheme(true)
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('stops following the system after an explicit choice, including the current theme', () => {
    const { result } = renderHook(() => useTheme())
    changeSystemTheme(true)
    act(() => result.current.setTheme('light'))
    changeSystemTheme(false)

    expect(result.current.theme).toBe('light')
    expect(storageMock.getItem('n3wth-theme')).toBe('light')
  })

  it('ignores invalid stored values and continues following the system', () => {
    storageMock.setItem('n3wth-theme', 'invalid')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')

    changeSystemTheme(true)
    changeSystemTheme(false)
    expect(result.current.theme).toBe('dark')
    expect(storageMock.getItem('n3wth-theme')).toBe('invalid')
  })

  it('shares explicit choices when storage is denied, including with later callers', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new Error('Storage denied') })
    const app = renderHook(() => useTheme())
    changeSystemTheme(true)
    changeSystemTheme(false)
    expect(app.result.current.theme).toBe('dark')

    act(() => app.result.current.setTheme('light'))
    const section = renderHook(() => useTheme())
    changeSystemTheme(false)
    expect(app.result.current.theme).toBe('light')
    expect(section.result.current.theme).toBe('light')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  })

  it('isolates custom storage keys while supporting custom attributes', () => {
    storageMock.setItem('custom-key', 'light')
    const app = renderHook(() => useTheme())
    const custom = renderHook(() => useTheme({ storageKey: 'custom-key', attribute: 'data-custom-theme' }))
    const peer = renderHook(() => useTheme({ storageKey: 'custom-key', attribute: 'data-custom-theme' }))
    expect(custom.result.current.theme).toBe('light')
    expect(app.result.current.theme).toBe('dark')

    act(() => custom.result.current.toggleTheme())
    expect(peer.result.current.theme).toBe('dark')
    act(() => app.result.current.toggleTheme())
    expect(custom.result.current.theme).toBe('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(document.documentElement).toHaveAttribute('data-custom-theme', 'dark')
    expect(storageMock.getItem('custom-key')).toBe('dark')
    expect(storageMock.getItem('n3wth-theme')).toBe('light')
  })

  it('shares a preference across callers using different attributes and defaults', () => {
    const app = renderHook(() => useTheme({ defaultTheme: 'light' }))
    const custom = renderHook(() => useTheme({ attribute: 'data-custom-theme' }))
    expect(custom.result.current.theme).toBe('light')

    act(() => custom.result.current.toggleTheme())
    expect(app.result.current.theme).toBe('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(document.documentElement).toHaveAttribute('data-custom-theme', 'dark')
  })

  it('uses one system listener until the last caller unmounts and reads fresh on remount', () => {
    const app = renderHook(() => useTheme())
    const section = renderHook(() => useTheme())
    expect(mediaQuery.addEventListener).toHaveBeenCalledTimes(1)
    app.unmount()
    expect(mediaQuery.removeEventListener).not.toHaveBeenCalled()
    changeSystemTheme(true)
    expect(section.result.current.theme).toBe('light')

    section.unmount()
    expect(mediaQuery.removeEventListener).toHaveBeenCalledTimes(1)
    expect(mediaListeners.size).toBe(0)
    changeSystemTheme(false)
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')

    const remounted = renderHook(() => useTheme())
    expect(remounted.result.current.theme).toBe('dark')
    expect(mediaListeners.size).toBe(1)
  })

  it('survives Strict Mode cleanup and resubscription with sibling callers', () => {
    const ThemeButton = ({ label, defaultTheme }: { label: string, defaultTheme: 'dark' | 'light' }) => {
      const { theme, toggleTheme } = useTheme({ defaultTheme })
      return createElement('button', { onClick: toggleTheme }, `${label}: ${theme}`)
    }
    const app = createElement(ThemeButton, { key: 'app', label: 'App', defaultTheme: 'dark' })
    const section = createElement(ThemeButton, { key: 'section', label: 'Section', defaultTheme: 'light' })
    const view = render(createElement(StrictMode, null, app, section))
    expect(mediaListeners.size).toBe(1)
    expect(view.getByRole('button', { name: 'App: dark' })).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'Section: dark' })).toBeInTheDocument()

    changeSystemTheme(true)
    changeSystemTheme(false)
    fireEvent.click(view.getByRole('button', { name: 'App: dark' }))
    expect(view.getByRole('button', { name: 'Section: light' })).toBeInTheDocument()

    const peer = renderHook(() => useTheme())
    expect(peer.result.current.theme).toBe('light')
    view.rerender(createElement(StrictMode, null, section))
    fireEvent.click(view.getByRole('button', { name: 'Section: light' }))
    expect(peer.result.current.theme).toBe('dark')
    expect(mediaListeners.size).toBe(1)
    view.unmount()
    expect(mediaListeners.size).toBe(1)
    peer.unmount()
    expect(mediaListeners.size).toBe(0)
  })

  it('reads fresh storage after a suspended render is discarded without committing', () => {
    const pending = new Promise<never>(() => {})
    const SuspendedTheme = () => {
      useTheme({ storageKey: 'abandoned-theme' })
      throw pending
    }
    storageMock.setItem('abandoned-theme', 'dark')
    const view = render(createElement(Suspense, { fallback: 'Loading' }, createElement(SuspendedTheme)))
    expect(view.getByText('Loading')).toBeInTheDocument()
    expect(storageMock.getItem).toHaveBeenCalledWith('abandoned-theme')
    expect(mediaListeners.size).toBe(0)
    expect(document.documentElement).not.toHaveAttribute('data-theme')
    view.unmount()

    storageMock.setItem('abandoned-theme', 'light')
    const { result } = renderHook(() => useTheme({ storageKey: 'abandoned-theme' }))
    expect(result.current.theme).toBe('light')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  })

  it('renders on the server without browser globals or shared request state', () => {
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('document', undefined)
    const ThemeLabel = ({ defaultTheme }: { defaultTheme: 'dark' | 'light' }) => {
      const { theme } = useTheme({ defaultTheme })
      return createElement('span', null, theme)
    }

    expect(renderToString(createElement(ThemeLabel, { defaultTheme: 'light' }))).toBe('<span>light</span>')
    expect(renderToString(createElement(ThemeLabel, { defaultTheme: 'dark' }))).toBe('<span>dark</span>')
    expect(storageMock.getItem).not.toHaveBeenCalled()
    expect(storageMock.setItem).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('hydrates the server default without mismatches, then uses the saved preference', async () => {
    const ThemeLabel = () => createElement('span', null, useTheme().theme)
    vi.stubGlobal('window', undefined)
    const html = renderToString(createElement(ThemeLabel))
    vi.unstubAllGlobals()
    storageMock.setItem('n3wth-theme', 'light')
    const container = document.createElement('div')
    container.innerHTML = html
    document.documentElement.setAttribute('data-theme', 'light')
    const onRecoverableError = vi.fn()

    let root: ReturnType<typeof hydrateRoot>
    await act(async () => {
      root = hydrateRoot(container, createElement(ThemeLabel), { onRecoverableError })
    })
    expect(container.textContent).toBe('light')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(onRecoverableError).not.toHaveBeenCalled()
    act(() => root.unmount())
  })
})
