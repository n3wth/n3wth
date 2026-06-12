import { useRef } from 'react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { AsciiField } from '../AsciiField'
import { gsap, useGSAP } from '../../lib/gsap'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      // [data-hero-reveal] elements start hidden via CSS gated behind
      // prefers-reduced-motion: no-preference, so under reduce there is
      // nothing to animate and nothing left hidden.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.to('[data-hero-reveal]', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.09,
        delay: 0.1,
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden"
    >
      <AsciiField />

      <div className="relative z-10 section-pad pad-air !pb-14 md:!pb-20 w-full">
        <p className="eyebrow mb-6 md:mb-8" data-hero-reveal>
          San Francisco — AI Product Leader
        </p>

        <h1
          className="display text-[clamp(2.75rem,11vw,8rem)]"
          style={{ lineHeight: 0.82 }}
          data-hero-reveal
        >
          Oliver
          <br />
          Newth
        </h1>

        <div className="mt-8 md:mt-12 grid gap-x-12 gap-y-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] max-w-4xl">
          <p
            className="text-lg md:text-2xl leading-snug display !tracking-tight"
            style={{ letterSpacing: '-0.02em' }}
            data-hero-reveal
          >
            AI at Google. <span className="accent">Art in the desert.</span>
          </p>
          <div className="space-y-4 max-w-md" data-hero-reveal>
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

        <div className="mt-10 md:mt-14 flex flex-wrap items-center gap-4" data-hero-reveal>
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
