import { useEffect, type RefObject } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Magnetic hover effect -- element subtly follows cursor on hover.
 * Uses GSAP quickTo for smooth interpolation.
 */
export function useMagnetic(ref: RefObject<HTMLElement | null>, strength = 0.3) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power2.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power2.out' })

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      xTo((e.clientX - cx) * strength)
      yTo((e.clientY - cy) * strength)
    }

    const onLeave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)

    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      gsap.set(el, { x: 0, y: 0 })
    }
  }, [ref, strength])
}
