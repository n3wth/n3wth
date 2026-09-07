'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function HeroAnimation({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

      // Title
      tl.to('.hero-title', {
        y: 0,
        opacity: 1,
        duration: 1.4,
        force3D: true,
      }, 0.2)

      // Subtitle — overlaps with title
      .to('.hero-subtitle', {
        y: 0,
        opacity: 1,
        duration: 1.2,
      }, 0.5)

      // CTAs — slight overshoot
      .to('.hero-cta', {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.1,
        ease: 'back.out(1.4)',
      }, 0.7)

      // Scroll-triggered fade out
      gsap.to('.hero-content', {
        scrollTrigger: {
          trigger: container.current,
          start: 'top top',
          end: '+=400',
          scrub: 1,
        },
        opacity: 0,
        scale: 0.96,
        y: -40,
        ease: 'none',
      })
    }, container)

    return () => ctx.revert()
  }, [])

  return <div ref={container}>{children}</div>
}
