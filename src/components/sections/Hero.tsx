import { Button } from '@astryxdesign/core/Button'
import { HeroBackdrop } from '../HeroBackdrop'

export function Hero() {
  return (
    <section
      id="top"
      className="relative -mt-20 min-h-[100svh] flex flex-col justify-end"
    >
      <HeroBackdrop />

      <div className="relative z-10 section-pad pad-air !pb-14 md:!pb-20 w-full">
        <p className="label mb-6 md:mb-8">
          AI agents · Design · San Francisco
        </p>

        <h1
          className="display text-[clamp(2.75rem,11vw,8rem)]"
          style={{ lineHeight: 0.82 }}
        >
          Oliver
          <br />
          Newth
        </h1>

        <div className="mt-8 md:mt-12">
          <p className="display text-xl leading-snug" style={{ letterSpacing: '-0.02em' }}>
            AI at Google. <span className="accent">Art in the desert.</span>
          </p>
          <p
            className="mt-4 text-sm leading-relaxed max-w-md"
            style={{ color: 'var(--ink-dim)' }}
          >
            I've shipped AI to billions at Google, Meta, and Microsoft, and
            spoke at Google I/O 2025. These days a standing team of autonomous
            agents ships my products while I design what they build.
          </p>
        </div>

        <div className="mt-10 md:mt-14 flex flex-wrap items-center gap-4">
          <Button label="Get in touch" variant="primary" href="/contact" />
          <Button label="View work" variant="ghost" href="/work" />
        </div>

        <p className="mt-12 md:mt-16 meta" style={{ color: 'var(--ink-faint)' }}>
          Google I/O 2025 speaker · Previously Covariant, Meta, Microsoft
        </p>
      </div>
    </section>
  )
}
