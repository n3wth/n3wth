'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface CountUpProps {
  value: number
  className?: string
  duration?: number
  delay?: number
}

/* Animates a number from 0 to its value on mount (locale-formatted).
   Renders the final value in markup so SSR/no-JS/reduced-motion all see
   the real number. */
export function CountUp({ value, className, duration = 1.2, delay = 0.9 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const proxy = { n: 0 }
    const tween = gsap.to(proxy, {
      n: value,
      duration,
      delay,
      ease: 'power3.out',
      onUpdate: () => {
        el.textContent = Math.round(proxy.n).toLocaleString('en-US')
      },
    })
    return () => {
      tween.kill()
      el.textContent = value.toLocaleString('en-US')
    }
  }, [value, duration, delay])

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString('en-US')}
    </span>
  )
}
