import { useEffect, useRef } from 'react'

const STAGGER_MS = 80
const SETTLE_MS = 1100

/**
 * Reveals descendants marked with [data-reveal] as they enter the viewport
 * by adding `.is-revealed`. The hidden state lives in CSS behind
 * prefers-reduced-motion: no-preference, so reduced-motion users always see
 * content immediately. Elements that intersect in the same batch stagger by
 * STAGGER_MS. Once an entrance settles, the attribute and inline delay are
 * removed so the reveal transition can't shadow an element's own hover
 * transitions (e.g. .cell border-color).
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (els.length === 0) return

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      els.forEach((el) => el.removeAttribute('data-reveal'))
      return
    }

    const timeouts = new Set<number>()
    const observer = new IntersectionObserver(
      (entries) => {
        let batch = 0
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          observer.unobserve(el)
          const delay = batch * STAGGER_MS
          el.style.transitionDelay = `${delay}ms`
          el.classList.add('is-revealed')
          const id = window.setTimeout(() => {
            el.style.transitionDelay = ''
            el.removeAttribute('data-reveal')
            timeouts.delete(id)
          }, SETTLE_MS + delay)
          timeouts.add(id)
          batch += 1
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    )
    els.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
      timeouts.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  return ref
}
