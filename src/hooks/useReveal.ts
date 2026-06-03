import { useEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

/**
 * Scroll-triggered fade + rise reveal for elements marked `[data-reveal]`
 * within the scoped ref. Respects prefers-reduced-motion (static fallback
 * is handled in CSS: `.reveal` stays visible).
 */
export function useReveal(scope: RefObject<HTMLElement | null>, selector = '[data-reveal]') {
  useEffect(() => {
    const root = scope.current
    if (!root) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const els = Array.from(root.querySelectorAll<HTMLElement>(selector))
    if (!els.length) return

    if (prefersReducedMotion) {
      gsap.set(els, { opacity: 1, y: 0 })
      return
    }

    const ctx = gsap.context(() => {
      els.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        )
      })
    }, root)

    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [scope, selector])
}
