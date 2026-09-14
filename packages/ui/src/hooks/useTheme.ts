import { useState, useEffect, useCallback } from 'react'

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

export function useTheme(options: UseThemeOptions = {}): UseThemeReturn {
  const {
    defaultTheme = 'dark',
    storageKey = 'n3wth-theme',
    attribute = 'data-theme',
  } = options

  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme

    const stored = readStoredTheme(storageKey)
    if (stored === 'dark' || stored === 'light') return stored

    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }

    return defaultTheme
  })

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)

      if (typeof window !== 'undefined') {
        try { localStorage.setItem(storageKey, newTheme) } catch { /* Storage may be disabled. */ }
        document.documentElement.setAttribute(attribute, newTheme)
      }
    },
    [storageKey, attribute]
  )

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  // Initialize theme on mount
  useEffect(() => {
    document.documentElement.setAttribute(attribute, theme)
  }, [attribute, theme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')

    const handleChange = (e: MediaQueryListEvent) => {
      const stored = readStoredTheme(storageKey)
      if (!stored) {
        setTheme(e.matches ? 'light' : 'dark')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [storageKey, setTheme])

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }
}
