'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

export function HomePageClient({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.from('.home-immersive', {
      opacity: 0,
      duration: 1.2,
      ease: 'power2.out',
    })

    gsap.from('.home-overlay', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12,
      delay: 0.8,
      ease: 'power3.out',
    })
  }, { scope: container })

  return <div ref={container}>{children}</div>
}
