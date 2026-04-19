import { useRef, lazy, Suspense, useState } from 'react'
import { gsap, SplitText, useGSAP } from '../../lib/gsap'

// Lazy load particle field to prioritize text content for FCP
const ParticleField = lazy(() => import('../ParticleField').then(m => ({ default: m.ParticleField })))

export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const splitRef = useRef<SplitText | null>(null)
  // Track if animation has started - content visible by default for LCP
  const [animationReady, setAnimationReady] = useState(false)
  const [entranceDone, setEntranceDone] = useState(false)

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
      const tl = gsap.timeline({ defaults: { force3D: true }, onComplete: () => setEntranceDone(true) })

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

      // Currently line fades in
      tl.fromTo(
        '[data-hero-currently]',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
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

  // Cursor-reactive kinetic effect on name characters (activates after entrance)
  useGSAP(
    () => {
      if (!entranceDone || !splitRef.current?.chars?.length || !containerRef.current) return

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return

      const chars = splitRef.current.chars as HTMLElement[]
      const section = containerRef.current
      const RADIUS = 150
      const MAX_Y = -8
      const MAX_SCALE = 1.05

      chars.forEach((c) => { c.style.willChange = 'transform' })

      const quickYs = chars.map((c) =>
        gsap.quickTo(c, 'y', { duration: 0.4, ease: 'power2.out' })
      )
      const quickScales = chars.map((c) =>
        gsap.quickTo(c, 'scale', { duration: 0.4, ease: 'power2.out' })
      )

      let rafId = 0
      let mouseX = -1000
      let mouseY = -1000

      const update = () => {
        rafId = 0
        for (let i = 0; i < chars.length; i++) {
          const rect = chars[i].getBoundingClientRect()
          const cx = rect.left + rect.width / 2
          const cy = rect.top + rect.height / 2
          const dx = cx - mouseX
          const dy = cy - mouseY
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < RADIUS) {
            const t = 1 - dist / RADIUS
            quickYs[i](MAX_Y * t * t)
            quickScales[i](1 + (MAX_SCALE - 1) * t * t)
          } else {
            quickYs[i](0)
            quickScales[i](1)
          }
        }
      }

      const onMove = (e: MouseEvent) => {
        mouseX = e.clientX
        mouseY = e.clientY
        if (!rafId) rafId = requestAnimationFrame(update)
      }

      const onLeave = () => {
        mouseX = -1000
        mouseY = -1000
        if (rafId) { cancelAnimationFrame(rafId); rafId = 0 }
        for (let i = 0; i < chars.length; i++) {
          quickYs[i](0)
          quickScales[i](1)
        }
      }

      section.addEventListener('mousemove', onMove)
      section.addEventListener('mouseleave', onLeave)

      return () => {
        if (rafId) cancelAnimationFrame(rafId)
        section.removeEventListener('mousemove', onMove)
        section.removeEventListener('mouseleave', onLeave)
        chars.forEach((c) => {
          c.style.willChange = ''
          gsap.set(c, { y: 0, scale: 1 })
        })
      }
    },
    { scope: containerRef, dependencies: [entranceDone] }
  )

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center px-6 md:px-12"
    >
      <Suspense fallback={null}>
        <ParticleField />
      </Suspense>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        {/* Big name - stacked for visual impact */}
        <h1
          ref={titleRef}
          className="text-[clamp(2.5rem,10vw,12rem)] font-display font-semibold tracking-tighter leading-[0.85] mb-4 sm:mb-6 md:mb-8 text-white"
          style={{ perspective: '1000px' }}
        >
          Oliver<br />Newth
        </h1>

        {/* The hook - visible by default for LCP, animated only after JS ready */}
        <p
          data-hero-tagline
          className={`text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl leading-snug max-w-2xl text-white font-display font-medium tracking-tight ${animationReady ? 'opacity-0' : 'opacity-100'}`}
        >
          AI at Google.<br className="sm:hidden" /> Art in the desert.
        </p>

        {/* Subtitle - visible by default for LCP */}
        <p
          data-hero-subtitle
          className={`mt-3 sm:mt-6 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-xl ${animationReady ? 'opacity-0' : 'opacity-100'}`}
          style={{ color: 'var(--color-grey-300)' }}
        >
          Shipping AI products to billions of users across Google, Meta, and Microsoft. Google I/O 2025 speaker.
        </p>

        {/* Currently signal - forward trajectory */}
        <p
          data-hero-currently
          className={`mt-3 sm:mt-4 text-sm sm:text-base md:text-lg font-sans ${animationReady ? 'opacity-0' : 'opacity-100'}`}
          style={{ color: 'var(--color-grey-400)' }}
        >
          Now building toward a world where AI agents work alongside humans, not just for them.
        </p>
      </div>
    </section>
  )
}
