import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

export function GameCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    if (!dot || !ring || !label) return

    // Skip on touch devices or reduced motion
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || prefersReducedMotion) {
      dot.style.display = 'none'
      ring.style.display = 'none'
      return
    }

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power2.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power2.out' })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.3, ease: 'power2.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.3, ease: 'power2.out' })

    let currentLabel = ''

    const onMove = (e: MouseEvent) => {
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
    }

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const interactive = target.closest('a, button, [role="button"]')
      const buildCard = target.closest('[data-build-card]')
      const contactCta = target.closest('[data-contact-cta]')

      if (contactCta) {
        gsap.to(ring, { width: 56, height: 56, duration: 0.2 })
        gsap.to(dot, { scale: 0, duration: 0.15 })
        if (currentLabel !== 'Email') {
          currentLabel = 'Email'
          label.textContent = 'Email'
          gsap.to(label, { opacity: 1, duration: 0.15 })
        }
      } else if (buildCard) {
        gsap.to(ring, { width: 56, height: 56, duration: 0.2 })
        gsap.to(dot, { scale: 0, duration: 0.15 })
        if (currentLabel !== 'View') {
          currentLabel = 'View'
          label.textContent = 'View'
          gsap.to(label, { opacity: 1, duration: 0.15 })
        }
      } else if (interactive) {
        gsap.to(ring, { width: 48, height: 48, duration: 0.2 })
        gsap.to(dot, { scale: 0.5, duration: 0.15 })
        if (currentLabel !== '') {
          currentLabel = ''
          gsap.to(label, { opacity: 0, duration: 0.1 })
        }
      } else {
        gsap.to(ring, { width: 32, height: 32, duration: 0.2 })
        gsap.to(dot, { scale: 1, duration: 0.15 })
        if (currentLabel !== '') {
          currentLabel = ''
          gsap.to(label, { opacity: 0, duration: 0.1 })
        }
      }
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
    }
  }, [])

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9998] pointer-events-none"
        style={{
          width: 8,
          height: 8,
          marginLeft: -4,
          marginTop: -4,
          borderRadius: '50%',
          background: 'white',
        }}
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9998] pointer-events-none flex items-center justify-center"
        style={{
          width: 32,
          height: 32,
          marginLeft: -16,
          marginTop: -16,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
        aria-hidden="true"
      >
        <span
          ref={labelRef}
          className="text-[10px] font-mono text-white uppercase tracking-wider opacity-0"
        />
      </div>
    </>
  )
}
