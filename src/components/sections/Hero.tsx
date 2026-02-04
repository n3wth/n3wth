import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { FloatingShapes } from '../FloatingShapes'

gsap.registerPlugin(SplitText)

export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const splitRef = useRef<SplitText | null>(null)

  useGSAP(
    () => {
      if (!containerRef.current || !titleRef.current) return

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return

      splitRef.current = new SplitText(titleRef.current, {
        type: 'chars',
        charsClass: 'hero-char',
      })

      const chars = splitRef.current.chars
      const tl = gsap.timeline({ defaults: { force3D: true } })

      // Name reveals character by character
      tl.fromTo(
        chars,
        { y: 100, opacity: 0, rotateX: -90 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1.2,
          ease: 'power3.out',
          stagger: { amount: 0.5, from: 'start' },
          transformOrigin: 'center bottom',
        }
      )

      // Tagline fades in
      tl.fromTo(
        '[data-hero-tagline]',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.4'
      )

      // Subtitle fades in
      tl.fromTo(
        '[data-hero-subtitle]',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        '-=0.5'
      )

      return () => {
        if (splitRef.current) {
          splitRef.current.revert()
          splitRef.current = null
        }
      }
    },
    { scope: containerRef }
  )

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center px-4 md:px-8"
    >
      <FloatingShapes />

      <div className="w-full max-w-6xl mx-auto relative z-10">
        {/* Big name - stacked for visual impact */}
        <h1
          ref={titleRef}
          className="text-[clamp(3rem,12vw,12rem)] font-display font-semibold tracking-tighter leading-[0.85] mb-6 md:mb-8 text-white text-glow"
          style={{ perspective: '1000px' }}
        >
          Oliver<br />Newth
        </h1>

        {/* The hook */}
        <p
          data-hero-tagline
          className="text-lg sm:text-2xl md:text-3xl lg:text-4xl leading-snug max-w-2xl opacity-0 text-white font-display font-medium tracking-tight text-glow-subtle"
        >
          AI at Google.<br className="sm:hidden" /> Art in the desert.
        </p>

        {/* Subtitle */}
        <p
          data-hero-subtitle
          className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl opacity-0"
          style={{ color: 'var(--color-grey-300)' }}
        >
          Building at the intersection of trust and wonder. 10+ years bringing AI systems from research to production.
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-4 md:left-8 flex items-center gap-3 text-white"
      >
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M8 4v16M4 16l4 4 4-4" />
        </svg>
        <span className="text-xs font-mono uppercase tracking-wider">Scroll</span>
      </div>
    </section>
  )
}
