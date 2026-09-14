import { useEffect, useRef } from 'react'

/** Reset new-page link clicks without taking over history or hash scrolling. */
export function useRouteScrollReset(pathname: string) {
  const destination = useRef<string | null>(null)
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return
      const url = new URL(anchor.href, location.href)
      destination.current = url.origin === location.origin && !url.hash && url.pathname !== location.pathname ? url.pathname : null
    }
    const pop = () => { destination.current = null }
    document.addEventListener('click', click, true)
    window.addEventListener('popstate', pop)
    return () => {
      document.removeEventListener('click', click, true)
      window.removeEventListener('popstate', pop)
    }
  }, [])

  useEffect(() => {
    if (destination.current !== pathname) return
    destination.current = null
    const frame = requestAnimationFrame(() => {
      if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname])
}
