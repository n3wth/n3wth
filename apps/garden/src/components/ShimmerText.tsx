'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface ShimmerTextProps {
  children: React.ReactNode
  /** Run one autonomous light sweep after mount (for touch devices). */
  sweepOnMount?: boolean
  sweepDelay?: number
  className?: string
}

/* Glassmorphic text shimmer, glow-free: the base text dims slightly while
   a sharp light spot clipped to the lettering reveals full-brightness
   glyphs at the cursor.

   For string children: uses CSS ::before with content: attr(data-text) so
   the text appears only once in the DOM (avoids duplicate H1 for SEO).

   For JSX children: falls back to a duplicate span with aria-hidden
   (acceptable for non-heading decorative text). */
export function ShimmerText({
  children,
  sweepOnMount = false,
  sweepDelay = 1.4,
  className = '',
}: ShimmerTextProps) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const isStringChild = typeof children === 'string'

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    // Reduced motion: no shimmer at all
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const setX = gsap.quickSetter(wrap, '--shine-x', 'px') as (v: number) => void
    const fade = (on: boolean, duration: number) => {
      gsap.to(wrap, { '--shine-opacity': on ? 1 : 0, duration, ease: 'power2.out', overwrite: 'auto' })
    }

    const onEnter = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect()
      setX(e.clientX - rect.left)
      fade(true, 0.25)
    }
    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect()
      setX(e.clientX - rect.left)
    }
    const onLeave = () => fade(false, 0.5)

    wrap.addEventListener('mouseenter', onEnter)
    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseleave', onLeave)

    // One autonomous sweep for pointerless devices / first impression
    let sweep: gsap.core.Tween | undefined
    if (sweepOnMount) {
      const width = wrap.offsetWidth
      const proxy = { x: -width * 0.25 }
      sweep = gsap.to(proxy, {
        x: width * 1.25,
        duration: 1.2,
        delay: sweepDelay,
        ease: 'power2.inOut',
        onStart: () => fade(true, 0.35),
        onUpdate: () => setX(proxy.x),
        onComplete: () => fade(false, 0.4),
      })
    }

    return () => {
      wrap.removeEventListener('mouseenter', onEnter)
      wrap.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
      sweep?.kill()
    }
  }, [sweepOnMount, sweepDelay])

  // String children: use data-text + ::before (no DOM duplication)
  if (isStringChild) {
    return (
      <span
        ref={wrapRef}
        data-text={children}
        className={`shimmer-text ${className}`}
      >
        {children}
      </span>
    )
  }

  // JSX children: fall back to duplicate span with aria-hidden
  return (
    <span ref={wrapRef} className={`shimmer-wrap ${className}`}>
      <span className="shimmer-base">{children}</span>
      <span aria-hidden className="shimmer-layer shimmer-shine">
        {children}
      </span>
    </span>
  )
}
