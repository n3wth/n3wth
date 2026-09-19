import { useCallback, useMemo, useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'

function readStoredTheme(key: string) {
  try { return localStorage.getItem(key) } catch { return null }
}

export interface UseThemeOptions {
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
}

export interface UseThemeReturn {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isDark: boolean
  isLight: boolean
}

const stores = new Map<string, ReturnType<typeof createThemeStore>>()

function createThemeStore(storageKey: string, defaultTheme: Theme) {
  const stored = typeof window === 'undefined' ? null : readStoredTheme(storageKey)
  let explicit = stored === 'dark' || stored === 'light'
  let theme: Theme = stored === 'dark' || stored === 'light' ? stored : defaultTheme
  const listeners = new Map<() => void, string>()
  const mediaQuery = typeof window === 'undefined'
    ? undefined
    : window.matchMedia('(prefers-color-scheme: light)')

  if (!explicit && mediaQuery?.matches) theme = 'light'

  const update = (newTheme: Theme) => {
    theme = newTheme
    for (const attribute of new Set(listeners.values())) {
      document.documentElement.setAttribute(attribute, theme)
    }
    for (const listener of listeners.keys()) listener()
  }

  const handleChange = (event: MediaQueryListEvent) => {
    if (!explicit) update(event.matches ? 'light' : 'dark')
  }

  const setTheme = (newTheme: Theme) => {
    explicit = true
    try { localStorage.setItem(storageKey, newTheme) } catch { /* Storage may be disabled. */ }
    update(newTheme)
  }

  const store = {
    getSnapshot: () => theme,
    setTheme,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    subscribe: (listener: () => void, attribute: string) => {
      if (listeners.size === 0) {
        stores.set(storageKey, store)
        mediaQuery?.addEventListener('change', handleChange)
      }
      listeners.set(listener, attribute)
      document.documentElement.setAttribute(attribute, theme)

      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) {
          mediaQuery?.removeEventListener('change', handleChange)
          stores.delete(storageKey)
        }
      }
    },
  }
  return store
}

function getThemeStore(storageKey: string, defaultTheme: Theme) {
  if (typeof window === 'undefined') return createThemeStore(storageKey, defaultTheme)
  const initialStore = stores.get(storageKey) ?? createThemeStore(storageKey, defaultTheme)
  const currentStore = () => stores.get(storageKey) ?? initialStore
  return {
    getSnapshot: () => currentStore().getSnapshot(),
    setTheme: (theme: Theme) => currentStore().setTheme(theme),
    toggleTheme: () => currentStore().toggleTheme(),
    subscribe: (listener: () => void, attribute: string) => currentStore().subscribe(listener, attribute),
  }
}

export function useTheme(options: UseThemeOptions = {}): UseThemeReturn {
  const {
    defaultTheme = 'dark',
    storageKey = 'n3wth-theme',
    attribute = 'data-theme',
  } = options

  const store = useMemo(
    () => getThemeStore(storageKey, defaultTheme),
    [storageKey, defaultTheme]
  )
  const subscribe = useCallback(
    (listener: () => void) => store.subscribe(listener, attribute),
    [store, attribute]
  )
  const theme = useSyncExternalStore(
    subscribe,
    store.getSnapshot,
    () => defaultTheme
  )

  return {
    theme,
    setTheme: store.setTheme,
    toggleTheme: store.toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }
}
