import { Suspense } from 'react'
import { SectionHeader } from '../Frame'
import { thoughtPieces } from '../../data/thinking'
import { registeredPieces } from '../thinking/registry'

/* Positions in the open: statement on the left, reasoning on the right.
   The previous version folded every argument into an identical
   "The reasons" accordion — the most personal writing on the site sat
   behind three closed doors. */
export function Thinking() {
  return (
    <section id="thinking" aria-label="Thinking">
      <SectionHeader
        as="h1"
        title="What I believe about production AI"
        lede="Three positions from shipping AI at scale and running an agent team in production — then three real dilemmas where you make the call."
      />

      {/* Registered pieces own their own interaction pattern instead of the
          fixed description+insights template below — one per real story,
          lazy-loaded so a piece using r3f doesn't weigh down the rest. */}
      <div className="section-pad pad-tight !pt-0 !pb-0">
        {registeredPieces.map(({ meta, Body }) => (
          <article
            key={meta.id}
            data-reveal
            className="py-12 md:py-16"
            style={{ borderTop: '1px solid var(--rail)' }}
          >
            <div className="mb-10 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:items-start">
              <div>
                <p className="font-mono text-xs" style={{ color: 'var(--ink-faint)' }}>
                  {new Date(meta.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <h2
                  className="display mt-2 text-[clamp(1.5rem,2.6vw,2.2rem)] max-w-[16ch]"
                  style={{ letterSpacing: '-0.025em', lineHeight: 1.08 }}
                >
                  {meta.title}
                </h2>
              </div>
              <p className="mt-6 md:mt-0 text-base md:text-lg leading-relaxed" style={{ color: 'var(--ink)' }}>
                {meta.dek}
              </p>
            </div>
            <Suspense fallback={<div className="h-40" aria-hidden />}>
              <Body />
            </Suspense>
          </article>
        ))}
      </div>

      <div className="section-pad pad-tight !pt-0">
        {thoughtPieces.map((piece) => (
          <article
            key={piece.id}
            data-reveal
            className="py-12 md:py-16 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16"
            style={{ borderTop: '1px solid var(--rail)' }}
          >
            <div className="mb-8 md:mb-0">
              <h2
                className="display text-[clamp(1.5rem,2.6vw,2.2rem)] max-w-[16ch]"
                style={{ letterSpacing: '-0.025em', lineHeight: 1.08 }}
              >
                {piece.title}
              </h2>
            </div>
            <div>
              <p
                className="text-base md:text-lg leading-relaxed mb-8"
                style={{ color: 'var(--ink)' }}
              >
                {piece.description}
              </p>
              <div className="space-y-5">
                {piece.insights.map((insight, idx) => (
                  <p
                    key={idx}
                    className="text-sm md:text-base leading-relaxed pl-5"
                    style={{
                      color: 'var(--ink-dim)',
                      borderLeft: '1px solid var(--rail)',
                    }}
                  >
                    {insight}
                  </p>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
