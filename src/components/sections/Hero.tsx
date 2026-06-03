import { useRef } from 'react'
import { ArrowDown, ArrowRight } from 'lucide-react'
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

      <div className="relative z-10 section-pad pad-air !pb-14 md:!pb-20 w-full">
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
