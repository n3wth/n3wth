import { ArrowDown, ArrowRight } from 'lucide-react'
import { AsciiField } from '../AsciiField'
import { heroStats } from '../../data/content'

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden"
    >
      <AsciiField />

      <div className="relative z-10 section-pad pad-air !pb-14 md:!pb-20 w-full">
        <p className="eyebrow mb-6 md:mb-8">
          San Francisco — AI Product Leader
        </p>

        <h1
          className="display text-[clamp(2.75rem,11vw,8rem)]"
          style={{ lineHeight: 0.82 }}
        >
          Oliver
          <br />
          Newth
        </h1>

        <div className="mt-8 md:mt-12 grid gap-x-12 gap-y-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] max-w-4xl">
          <p
            className="text-lg md:text-2xl leading-snug display !tracking-tight"
            style={{ letterSpacing: '-0.02em' }}
          >
            AI at Google. <span className="accent">Art in the desert.</span>
          </p>
          <div className="space-y-4 max-w-md">
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

        <div className="mt-10 md:mt-14 flex flex-wrap items-center gap-4">
          <a href="#contact" className="btn btn-solid">
            Get in touch
            <ArrowRight size={16} strokeWidth={1.5} className="btn-arrow" aria-hidden="true" />
          </a>
          <a href="#work" className="btn" style={{ borderColor: 'var(--rail)' }}>
            View work
            <ArrowDown size={16} strokeWidth={1.5} className="btn-arrow" aria-hidden="true" />
          </a>
        </div>

        <dl
          className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-px border"
          style={{ background: 'var(--rail)', borderColor: 'var(--rail)' }}
        >
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col-reverse px-4 py-4 md:px-5 md:py-5"
              style={{ background: 'var(--bg)' }}
            >
              <dt className="meta mt-1">{stat.label}</dt>
              <dd className="display m-0 text-xl md:text-2xl !tracking-tight">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
