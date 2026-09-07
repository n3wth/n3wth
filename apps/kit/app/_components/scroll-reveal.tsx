'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export function ScrollReveal({
  children,
  className,
  stagger = 0.1,
  y = 60,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
  y?: number
  delay?: number
}) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const items = container.current?.querySelectorAll('.reveal-item')
    if (!items?.length) {
      gsap.from(container.current, {
        y,
        opacity: 0,
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
      return
    }

    gsap.from(items, {
      y,
      opacity: 0,
      duration: 1,
      delay,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      force3D: true,
    })
  }, { scope: container })

  return <div ref={container} className={className}>{children}</div>
}
