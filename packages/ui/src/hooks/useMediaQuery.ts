import { useCallback, useMemo, useSyncExternalStore } from 'react'

/**
 * Standard breakpoints matching Tailwind CSS defaults
 * sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Hook for responsive media queries with SSR safety
 * Uses the supplied default during SSR and hydration
 *
 * @param query - CSS media query string
 * @param defaultValue - Initial value for SSR (defaults to false)
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const mediaQuery = window.matchMedia(query)
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [query])
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])
  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue])
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/**
 * Returns true when viewport is mobile width (< 768px)
 * Mobile-first default: returns true initially for SSR
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)', true)
}

/**
 * Returns true when viewport is tablet width (768px - 1023px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

/**
 * Returns true when viewport is desktop width (>= 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

/**
 * Returns true when viewport is large desktop width (>= 1280px)
 */
export function useIsLargeDesktop(): boolean {
  return useMediaQuery('(min-width: 1280px)')
}

/**
 * Returns the current breakpoint name
 * Useful for conditional rendering based on screen size
 */
export function useBreakpoint(): Breakpoint | 'xs' {
  const isSm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`)
  const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`)
  const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`)
  const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`)
  const is2xl = useMediaQuery(`(min-width: ${BREAKPOINTS['2xl']}px)`)

  return useMemo(() => {
    if (is2xl) return '2xl'
    if (isXl) return 'xl'
    if (isLg) return 'lg'
    if (isMd) return 'md'
    if (isSm) return 'sm'
    return 'xs'
  }, [isSm, isMd, isLg, isXl, is2xl])
}

/**
 * Returns true when user prefers touch interaction
 * Useful for adapting UI interactions
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(hover: none) and (pointer: coarse)')
}

/**
 * Returns true when viewport is in portrait orientation
 */
export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)')
}

/**
 * Returns true when viewport is in landscape orientation
 */
export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)')
}
