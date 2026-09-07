'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

function ShapeBlock({
  className,
  bg,
  children,
  size = 'md',
}: {
  className?: string
  bg: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: 'h-10 w-10 rounded-lg',
    md: 'h-14 w-14 rounded-xl',
    lg: 'h-16 w-16 rounded-2xl',
  }
  return (
    <div className={className}>
      <div className={`${sizes[size]} ${bg} flex items-center justify-center`}>
        {children}
      </div>
    </div>
  )
}

function CircleShape() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" />
    </svg>
  )
}

function SquareShape() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="5" width="14" height="14" rx="2" stroke="white" strokeWidth="2" />
    </svg>
  )
}

function TriangleShape() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 5L20 19H4L12 5Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

function DiamondShape() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="12" y="3" width="12.73" height="12.73" rx="2" stroke="white" strokeWidth="2" transform="rotate(45 12 3)" />
    </svg>
  )
}

function CrossShape() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 4V20M4 12H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function HalfCircleShape() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 16A8 8 0 0120 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function LinesShape() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5 8H19M5 12H15M5 16H11" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function RingShape() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" strokeDasharray="4 3" />
    </svg>
  )
}

export function FloatingElements() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const items = container.current?.querySelectorAll('.float-item')
    if (!items) return

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, scale: 0.6, y: 20 })

      items.forEach((item, i) => {
        const yRange = 6 + Math.random() * 10
        const xRange = 3 + Math.random() * 6
        const duration = 5 + Math.random() * 4
        const delay = i * 0.15

        gsap.to(item, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.4,
          delay: 0.6 + delay,
          ease: 'expo.out',
        })

        gsap.to(item, {
          y: `+=${yRange}`,
          x: `+=${xRange}`,
          duration,
          delay: 2.5 + delay,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      })
    }, container)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={container} className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Right side */}
      <ShapeBlock className="float-item absolute right-[4%] top-[10%] rotate-[-6deg]" bg="bg-blue-600" size="lg">
        <CircleShape />
      </ShapeBlock>
      <ShapeBlock className="float-item absolute right-[2%] top-[40%] rotate-[3deg]" bg="bg-emerald-600" size="md">
        <LinesShape />
      </ShapeBlock>
      <ShapeBlock className="float-item absolute right-[12%] top-[65%] rotate-[-4deg]" bg="bg-orange-500" size="sm">
        <CrossShape />
      </ShapeBlock>

      {/* Left side */}
      <ShapeBlock className="float-item absolute left-[3%] top-[15%] rotate-[4deg]" bg="bg-red-500" size="md">
        <TriangleShape />
      </ShapeBlock>
      <ShapeBlock className="float-item absolute left-[5%] top-[50%] rotate-[-5deg]" bg="bg-violet-600" size="lg">
        <SquareShape />
      </ShapeBlock>
      <ShapeBlock className="float-item absolute left-[2%] top-[78%] rotate-[6deg]" bg="bg-amber-500" size="sm">
        <DiamondShape />
      </ShapeBlock>

      {/* Corners */}
      <ShapeBlock className="float-item absolute left-[15%] top-[85%] rotate-[-3deg]" bg="bg-blue-600" size="sm">
        <HalfCircleShape />
      </ShapeBlock>
      <ShapeBlock className="float-item absolute right-[8%] top-[82%] rotate-[5deg]" bg="bg-emerald-600" size="md">
        <RingShape />
      </ShapeBlock>
    </div>
  )
}

export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-[0.025]">
        <filter id="hero-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-noise)" />
      </svg>
    </div>
  )
}
