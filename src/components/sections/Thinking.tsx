import { SectionHeader } from '../Frame'
import { thoughtPieces } from '../../data/thinking'

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
