import { useRef } from 'react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { gsap, useGSAP } from '../../lib/gsap'
import { AsciiField } from '../AsciiField'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced || !titleRef.current) return

      // Restraint: one quiet opacity fade for the headline — no per-char
      // stagger, no y-translate. Calm ease-out, no overshoot.
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      tl.from(titleRef.current, { opacity: 0, duration: 0.6 })
        .from('[data-hero-eyebrow]', { opacity: 0, duration: 0.5 }, 0.05)
        .from('[data-hero-fade]', { opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.3')
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

      <div className="relative z-10 section-pad pad-air !pb-14 md:!pb-20 w-full">
        <p data-hero-eyebrow className="eyebrow mb-6 md:mb-8">
          San Francisco — AI Product Leader
        </p>

        <h1
          ref={titleRef}
          className="display text-[clamp(2.75rem,11vw,8rem)]"
          style={{ overflow: 'hidden', lineHeight: 0.82 }}
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
            AI at Google. <span className="accent">Art in the desert.</span>
          </p>
          <div data-hero-fade className="space-y-4 max-w-md">
            <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
              I've shipped AI products to billions of users across Google, Meta,
              and Microsoft, and spoke at Google I/O 2025. A decade taking AI
              systems from research to production.
            </p>
            <p className="meta leading-relaxed">
              These days I'm focused on agents that work alongside people, not
              just for them.
            </p>
          </div>
        </div>

        <div data-hero-fade className="mt-10 md:mt-14 flex flex-wrap items-center gap-4">
          <a href="#contact" className="btn btn-solid">
            Get in touch
            <ArrowRight size={16} strokeWidth={1.5} className="btn-arrow" aria-hidden="true" />
          </a>
          <a href="#work" className="btn" style={{ borderColor: 'var(--rail)' }}>
            View work
            <ArrowDown size={16} strokeWidth={1.5} className="btn-arrow" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
