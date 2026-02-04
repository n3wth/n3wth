import { useRef, lazy, Suspense, useState } from 'react'
import { gsap, SplitText, useGSAP } from '../../lib/gsap'

// Lazy load decorative shapes to prioritize text content for FCP
const FloatingShapes = lazy(() => import('../FloatingShapes').then(m => ({ default: m.FloatingShapes })))

export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const splitRef = useRef<SplitText | null>(null)
  // Track if animation has started - content visible by default for LCP
  const [animationReady, setAnimationReady] = useState(false)

  useGSAP(
    () => {
      if (!containerRef.current || !titleRef.current) return

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return

      // Mark animation as ready before starting - hides content briefly for reveal
      setAnimationReady(true)

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
      <Suspense fallback={null}>
        <FloatingShapes />
      </Suspense>

      <div className="w-full max-w-6xl mx-auto relative z-10 px-2 sm:px-0">
        {/* Big name - stacked for visual impact */}
        <h1
          ref={titleRef}
          className="text-[clamp(2.5rem,10vw,12rem)] font-display font-semibold tracking-tighter leading-[0.85] mb-4 sm:mb-6 md:mb-8 text-white text-glow"
          style={{ perspective: '1000px' }}
        >
          Oliver<br />Newth
        </h1>

        {/* The hook - visible by default for LCP, animated only after JS ready */}
        <p
          data-hero-tagline
          className={`text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl leading-snug max-w-2xl text-white font-display font-medium tracking-tight text-glow-subtle ${animationReady ? 'opacity-0' : 'opacity-100'}`}
        >
          AI at Google.<br className="sm:hidden" /> Art in the desert.
        </p>

        {/* Subtitle - visible by default for LCP */}
        <p
          data-hero-subtitle
          className={`mt-3 sm:mt-6 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-xl ${animationReady ? 'opacity-0' : 'opacity-100'}`}
          style={{ color: 'var(--color-grey-300)' }}
        >
          Building at the intersection of trust and wonder. 10+ years bringing AI systems from research to production.
        </p>
      </div>
    </section>
  )
}
