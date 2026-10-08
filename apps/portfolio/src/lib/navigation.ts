import { useCallback, useSyncExternalStore } from 'react'

const subscribe = (notify: () => void) => {
  window.addEventListener('popstate', notify)
  return () => window.removeEventListener('popstate', notify)
}
const browserSearch = () => window.location.search
const serverSearch = () => ''
const browserReady = () => true
const serverReady = () => false

export function useHydrated() {
  return useSyncExternalStore(subscribe, browserReady, serverReady)
}

/** Local query controls update the URL without replacing the document. */
export function useQueryString() {
  const search = useSyncExternalStore(subscribe, browserSearch, serverSearch)
  const update = useCallback((href: string, options?: { replace?: boolean }) => {
    window.history[options?.replace ? 'replaceState' : 'pushState'](null, '', href)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, [])
  return [new URLSearchParams(search), update] as const
}
