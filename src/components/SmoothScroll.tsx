import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const rafCallbackRef = useRef<((time: number) => void) | null>(null)

  useEffect(() => {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    lenisRef.current = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.5,
      wheelMultiplier: 1,
      autoResize: true,
    })

    // Connect Lenis to GSAP ScrollTrigger
    lenisRef.current.on('scroll', ScrollTrigger.update)

    // Store callback in ref for proper cleanup
    rafCallbackRef.current = (time: number) => {
      lenisRef.current?.raf(time * 1000)
    }

    gsap.ticker.add(rafCallbackRef.current)
    gsap.ticker.lagSmoothing(0)

    return () => {
      if (rafCallbackRef.current) {
        gsap.ticker.remove(rafCallbackRef.current)
      }
      lenisRef.current?.destroy()
    }
  }, [])

  return <>{children}</>
}
