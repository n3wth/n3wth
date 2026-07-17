import { Button } from '@astryxdesign/core/Button'
import { Rule } from '../Frame'
import { HeroBackdrop } from '../HeroBackdrop'
import { heroStats } from '../../data/content'

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
            spoke at Google I/O 2025. Now I work at the front of two crafts:
            agentic systems — my products ship daily via a standing team of
            autonomous agents — and the visual design of everything they build.
          </p>
        </div>

        <div className="mt-10 md:mt-14 flex flex-wrap items-center gap-4">
          <Button label="Get in touch" variant="primary" href="#contact" />
          <Button label="View work" variant="ghost" href="#work" />
        </div>

        <div className="mt-12 md:mt-16">
          <Rule />
          <dl
            className="grid grid-cols-2 md:grid-cols-4 gap-px"
            style={{ background: 'var(--rail)' }}
          >
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col-reverse px-4 py-4 md:px-5 md:py-5"
                style={{ background: 'var(--bg)' }}
              >
                {/* dt precedes dd in the DOM for valid <dl> semantics;
                    flex-col-reverse keeps the value visually first. */}
                <dt
                  className="mt-1.5 text-[11px] uppercase tracking-[0.08em]"
                  style={{ color: 'var(--ink-faint)' }}
                >
                  {stat.label}
                </dt>
                <dd
                  className="text-sm font-semibold tracking-[-0.01em] m-0"
                  style={{ color: 'var(--ink)' }}
                >
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
