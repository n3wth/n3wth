import { useRef } from 'react'
import { gsap, SplitText, useGSAP } from '../../lib/gsap'
import { AsciiField } from '../AsciiField'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const splitRef = useRef<SplitText | null>(null)

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced || !titleRef.current) return

      splitRef.current = new SplitText(titleRef.current, {
        type: 'chars',
        charsClass: 'hero-char',
      })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from(splitRef.current.chars, {
        yPercent: 110,
        opacity: 0,
        duration: 1,
        stagger: { amount: 0.5, from: 'start' },
      })
        .from('[data-hero-eyebrow]', { opacity: 0, y: 16, duration: 0.6 }, 0.1)
        .from(
          '[data-hero-fade]',
          { opacity: 0, y: 20, duration: 0.7, stagger: 0.12 },
          '-=0.5'
        )

      return () => {
        splitRef.current?.revert()
        splitRef.current = null
      }
    },
    { scope: ref }
  )

  return (
    <section
      ref={ref}
      id="top"
      className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden"
    >
      <AsciiField />

      {/* coordinate marks */}
      <span
        aria-hidden="true"
        className="absolute left-6 md:left-10 top-20 md:top-24 meta"
      >
        37.7749° N
      </span>
      <span
        aria-hidden="true"
        className="absolute right-6 md:right-10 top-20 md:top-24 meta text-right"
      >
        122.4194° W
      </span>

      <div className="relative z-10 section-pad !pb-14 md:!pb-20 w-full">
        <p data-hero-eyebrow className="eyebrow mb-6 md:mb-8">
          San Francisco — AI Product Leader
        </p>

        <h1
          ref={titleRef}
          className="display text-[clamp(3.25rem,15vw,12rem)]"
          style={{ overflow: 'hidden' }}
        >
          Oliver
          <br />
          Newth
        </h1>

        <div className="mt-8 md:mt-12 grid gap-x-12 gap-y-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] max-w-4xl">
          <p
            data-hero-fade
            className="text-lg md:text-2xl leading-snug display !tracking-tight"
            style={{ letterSpacing: '-0.02em' }}
          >
            AI at Google. <span className="signal">Art in the desert.</span>
          </p>
          <div data-hero-fade className="space-y-4 max-w-md">
            <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--dim)' }}>
              Shipping AI products to billions of users across Google, Meta, and
              Microsoft. Google I/O 2025 speaker. A decade bringing AI systems
              from research to production.
            </p>
            <p className="meta leading-relaxed">
              Now building toward a world where AI agents work alongside humans,
              not just for them.
            </p>
          </div>
        </div>

        <div data-hero-fade className="mt-10 md:mt-14 flex flex-wrap items-center gap-4">
          <a href="#contact" className="btn">
            Get in touch
          </a>
          <a href="#work" className="btn" style={{ borderColor: 'var(--rail)' }}>
            View work ↓
          </a>
        </div>
      </div>
    </section>
  )
}
