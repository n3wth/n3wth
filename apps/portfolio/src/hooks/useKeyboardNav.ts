import { useEffect } from 'react'
import { gsap } from '../lib/gsap'

/* Keyed by KeyboardEvent.code: on macOS Option+digit mutates e.key to
   '¡™£…', so an e.key lookup with altKey held can never match. Only ids
   that exist in the DOM — the old '#ai-explainer' and '#creative'
   bindings pointed at sections removed long ago. */
const SECTION_CODES: Record<string, string> = {
  Digit1: '#work',
  Digit2: '#building',
  Digit3: '#thinking',
  Digit4: '#contact',
}

/**
 * Option+1-4 jumps to sections, with a brief flash on the heading.
 * The modifier keeps bare digits free for speech input and normal typing
 * (WCAG 2.1.4); input/textarea focus still bails.
 */
export function useKeyboardNav() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.metaKey || e.ctrlKey) return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const target = SECTION_CODES[e.code]
      if (!target) return

      const el = document.querySelector(target)
      if (!el) return

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })

      // Brief flash on the section header (h1 on route-lead sections)
      const header = el.querySelector('h1, h2')
      if (header && !prefersReducedMotion) {
        gsap.fromTo(
          header,
          { color: '#ffffff' },
          { color: '', duration: 0.8, ease: 'power2.out' }
        )
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
