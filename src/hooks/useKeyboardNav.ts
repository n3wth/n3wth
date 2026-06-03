import { useEffect } from 'react'
import { gsap } from '../lib/gsap'

const SECTION_KEYS: Record<string, string> = {
  '1': '#work',
  '2': '#building',
  '3': '#thinking',
  '4': '#frameworks',
  '5': '#creative',
  '6': '#contact',
}

/**
 * Press 1-6 to jump to sections. Shows a brief flash indicator.
 * Only active when no input/textarea is focused.
 */
export function useKeyboardNav() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Skip if typing in an input
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const target = SECTION_KEYS[e.key]
      if (!target) return

      const el = document.querySelector(target)
      if (!el) return

      el.scrollIntoView({ behavior: 'smooth' })

      // Brief flash on the section header
      const header = el.querySelector('h2')
      if (header) {
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
