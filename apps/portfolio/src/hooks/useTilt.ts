import { useEffect, type RefObject } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Subtle 3D tilt effect on hover. Max 4deg rotation.
 */
export function useTilt(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    el.style.transformStyle = 'preserve-3d'
    el.style.perspective = '800px'

    const rotateXTo = gsap.quickTo(el, 'rotateX', { duration: 0.3, ease: 'power2.out' })
    const rotateYTo = gsap.quickTo(el, 'rotateY', { duration: 0.3, ease: 'power2.out' })

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const maxDist = Math.max(rect.width, rect.height) / 2

      const dx = (e.clientX - cx) / maxDist
      const dy = (e.clientY - cy) / maxDist

      rotateYTo(dx * 4)
      rotateXTo(-dy * 4)
    }

    const onLeave = () => {
      rotateXTo(0)
      rotateYTo(0)
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)

    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      gsap.set(el, { rotateX: 0, rotateY: 0 })
      el.style.transformStyle = ''
      el.style.perspective = ''
    }
  }, [ref])
}
