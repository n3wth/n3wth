import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { siteConfig } from '../../data/content'
import { DataStream } from '../DataStream'
import { MagneticButton } from '../MagneticButton'

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
          stagger: { amount: 0.6, from: 'start' },
          transformOrigin: 'center bottom',
        }
      )

      // Tagline fades in
      tl.fromTo(
        '[data-hero-tagline]',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      )

      // Companies list
      tl.fromTo(
        '[data-company-tag]',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
        '-=0.4'
      )

      // CTA
      tl.fromTo(
        '[data-hero-cta]',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
        '-=0.2'
      )

      // Animated accent shapes
      tl.fromTo(
        '[data-hero-accent]',
        { scale: 0, opacity: 0, rotation: -180 },
        { scale: 1, opacity: 1, rotation: 0, duration: 1.2, stagger: 0.2, ease: 'power3.out' },
        '-=1'
      )

      // Subtle floating animation for accents
      gsap.to('[data-hero-accent]', {
        y: 'random(-20, 20)',
        rotation: 'random(-5, 5)',
        duration: 'random(3, 5)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { amount: 1, from: 'random' },
      })

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
      className="relative min-h-screen flex items-center px-6 md:px-12"
    >
      {/* Data stream - represents AI/data flowing at scale */}
      <DataStream />

      <div className="w-full max-w-6xl relative z-10">
        {/* Name - the anchor */}
        <h1
          ref={titleRef}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[9rem] font-display font-semibold tracking-tighter leading-[0.85] mb-8 text-white"
          style={{ perspective: '1000px' }}
        >
          {siteConfig.name}
        </h1>

        {/* The hook - human, memorable */}
        <p
          data-hero-tagline
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed mb-12 max-w-2xl opacity-0"
          style={{ color: 'var(--color-grey-200)' }}
        >
          I make AI safe at billion-user scale.
          <span style={{ color: 'var(--color-grey-400)' }}>
            {' '}By day, I integrate DeepMind into Google products. By night, I build things that glow in the desert.
          </span>
        </p>

        {/* The proof - where you've done it */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          <span
            data-company-tag
            className="text-sm opacity-0"
            style={{ color: 'var(--color-grey-500)' }}
          >
            Currently
          </span>
          <span
            data-company-tag
            className="text-sm font-medium opacity-0"
            style={{ color: 'var(--color-grey-300)' }}
          >
            Google
          </span>
          <span
            data-company-tag
            className="text-sm opacity-0"
            style={{ color: 'var(--color-grey-600)' }}
          >
            Previously
          </span>
          {['Meta', 'Microsoft', 'Covariant'].map((company, i) => (
            <span
              key={company}
              data-company-tag
              className="text-sm font-medium opacity-0"
              style={{ color: 'var(--color-grey-400)' }}
            >
              {company}{i < 2 && <span style={{ color: 'var(--color-grey-600)' }}>&nbsp;·&nbsp;</span>}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-6">
          <MagneticButton
            href="#work"
            className="text-sm text-white px-6 py-3 rounded-full focus-ring opacity-0"
            style={{
              background: '#111111',
              border: '1px solid #2a2a2a',
            }}
            strength={0.4}
            data-hero-cta
          >
            See my work
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </MagneticButton>
          <MagneticButton
            href={`mailto:${siteConfig.email}`}
            className="text-sm link-hover opacity-0 focus-ring rounded"
            style={{ color: 'var(--color-grey-400)' }}
            strength={0.2}
            data-hero-cta
          >
            {siteConfig.email}
          </MagneticButton>
        </div>
      </div>

      {/* Animated geometric accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Circle accent - top right */}
        <div
          data-hero-accent
          className="absolute w-32 h-32 md:w-48 md:h-48 rounded-full"
          style={{
            top: '15%',
            right: '10%',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
        {/* Diamond accent - bottom right */}
        <div
          data-hero-accent
          className="absolute w-16 h-16 md:w-24 md:h-24"
          style={{
            bottom: '25%',
            right: '20%',
            border: '1px solid rgba(255,255,255,0.05)',
            transform: 'rotate(45deg)',
          }}
        />
        {/* Small circle - mid left */}
        <div
          data-hero-accent
          className="absolute w-8 h-8 md:w-12 md:h-12 rounded-full"
          style={{
            top: '40%',
            left: '5%',
            background: 'rgba(255,255,255,0.03)',
          }}
        />
      </div>

      {/* Scroll indicator - aligned with content */}
      <div
        className="absolute bottom-8 left-6 md:left-12 flex items-center gap-3"
        style={{ color: 'var(--color-grey-600)' }}
      >
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M8 4v16M4 16l4 4 4-4" />
        </svg>
        <span className="text-xs font-mono uppercase tracking-wider">Scroll</span>
      </div>
    </section>
  )
}
