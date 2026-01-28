import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin)

interface Props {
  className?: string
  direction?: 'left' | 'right'
}

export function SectionDivider({ className = '', direction = 'right' }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  useGSAP(() => {
    if (!svgRef.current || !pathRef.current) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    // Draw the path on scroll
    gsap.fromTo(
      pathRef.current,
      { drawSVG: '0%' },
      {
        drawSVG: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: svgRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1,
        },
      }
    )
  }, [])

  // Flowing curve path that spans the width
  const path = direction === 'right'
    ? 'M0,50 Q200,10 400,50 T800,50 T1200,50'
    : 'M1200,50 Q1000,90 800,50 T400,50 T0,50'

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg
        ref={svgRef}
        viewBox="0 0 1200 100"
        className="w-full h-auto"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          d={path}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

// Variant: Animated flowing line that reveals on scroll
export function FlowingLine({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current || !lineRef.current) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    gsap.fromTo(
      lineRef.current,
      { scaleX: 0, transformOrigin: 'left center' },
      {
        scaleX: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'center center',
          scrub: 1,
        },
      }
    )
  }, [])

  return (
    <div ref={containerRef} className={`w-full py-8 ${className}`}>
      <div
        ref={lineRef}
        className="h-px w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        }}
      />
    </div>
  )
}

// Variant: Dot that traces a path
export function TracingDot({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current || !dotRef.current) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    gsap.fromTo(
      dotRef.current,
      { left: '0%', opacity: 0 },
      {
        left: '100%',
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1,
        },
      }
    )
  }, [])

  return (
    <div ref={containerRef} className={`relative w-full h-8 ${className}`}>
      <div
        className="absolute top-1/2 left-0 right-0 h-px"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      />
      <div
        ref={dotRef}
        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
        style={{ background: 'rgba(255,255,255,0.3)' }}
      />
    </div>
  )
}
