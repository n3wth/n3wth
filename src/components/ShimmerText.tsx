import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { gsap } from '../lib/gsap'

interface ShimmerTextProps {
  children: ReactNode
  /** Run one autonomous light sweep after mount (first impression / touch). */
  sweepOnMount?: boolean
  sweepDelay?: number
  className?: string
}

/* Cursor-tracking light reveal, glow-free (same system as garden.n3wth.com):
   the base text dims slightly while a sharp light spot clipped to the
   lettering reveals full-brightness glyphs at the cursor. The cursor x is
   written to a CSS var on the wrapper; a transparent text clone carries the
   spotlight gradient. */
export function ShimmerText({
  children,
  sweepOnMount = false,
  sweepDelay = 1.4,
  className = '',
}: ShimmerTextProps) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const shineRef = useRef<HTMLSpanElement>(null)
  const baseRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const shine = shineRef.current
    const base = baseRef.current
    if (!wrap || !shine || !base) return

    // Reduced motion: no shimmer at all — the hover tweens and the
    // cursor-following light are motion, not just the mount sweep.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const setX = gsap.quickSetter(wrap, '--shine-x', 'px') as (v: number) => void
    // The light trails the cursor on an eased delay rather than snapping to
    // it — a proxy value eases toward the pointer, quickTo restarting the
    // tween on every move so fast sweeps lag and settle naturally.
    const pos = { x: 0 }
    const xTo = gsap.quickTo(pos, 'x', {
      duration: 0.6,
      ease: 'power3.out',
      onUpdate: () => setX(pos.x),
    })
    // Staggered reveal: the light arrives first, the base dims a beat later
    // (and recovers a beat after the light leaves).
    const fade = (on: boolean) => {
      gsap.to(shine, {
        opacity: on ? 1 : 0,
        duration: on ? 0.35 : 0.55,
        ease: 'power2.out',
        overwrite: 'auto',
      })
      gsap.to(base, {
        opacity: on ? 0.45 : 1,
        duration: on ? 0.5 : 0.7,
        delay: on ? 0.06 : 0.1,
        ease: 'power2.inOut',
        overwrite: 'auto',
      })
    }

    const onEnter = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect()
      // Appear at the entry point (no tween across from the last position),
      // then let subsequent movement trail.
      pos.x = e.clientX - rect.left
      setX(pos.x)
      xTo(pos.x)
      fade(true)
    }
    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect()
      xTo(e.clientX - rect.left)
    }
    const onLeave = () => fade(false)

    wrap.addEventListener('mouseenter', onEnter)
    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseleave', onLeave)

    let sweep: gsap.core.Tween | undefined
    if (sweepOnMount) {
      const width = wrap.offsetWidth
      const proxy = { x: -width * 0.25 }
      sweep = gsap.to(proxy, {
        x: width * 1.25,
        duration: 1.4,
        delay: sweepDelay,
        ease: 'power2.inOut',
        onStart: () => fade(true),
        onUpdate: () => setX(proxy.x),
        onComplete: () => fade(false),
      })
    }

    return () => {
      wrap.removeEventListener('mouseenter', onEnter)
      wrap.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
      sweep?.kill()
    }
  }, [sweepOnMount, sweepDelay])

  return (
    <span ref={wrapRef} className={`shimmer-wrap ${className}`}>
      <span ref={baseRef} className="shimmer-base">{children}</span>
      <span ref={shineRef} aria-hidden className="shimmer-layer">
        {children}
      </span>
    </span>
  )
}
