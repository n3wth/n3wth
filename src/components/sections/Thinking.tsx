import { SectionHeader } from '../Frame'
import { thoughtPieces } from '../../data/thinking'
import { registeredPieces } from '../thinking/registry'
import { ThinkingIndex } from '../thinking/kit/ThinkingIndex'

/* Positions in the open: statement on the left, reasoning on the right.
   The previous version folded every argument into an identical
   "The reasons" accordion — the most personal writing on the site sat
   behind three closed doors. Registered pieces have since moved to their
   own routes (/thinking/:slug, src/pages/ThinkingPiece.tsx) — this page
   is the index into them, not another accordion wearing a map skin. */
export function Thinking() {
  return (
    <section id="thinking" aria-label="Thinking">
      <SectionHeader
        as="h1"
        title="What building this actually taught me"
        lede="Every piece below started as a real bug, a tradeoff, or a decision made while building this site and the agents behind it. The last one explains how the batch got built."
      />

      <ThinkingIndex pieces={registeredPieces} />

      {/* Plain description+insights pieces that haven't graduated to a
          full registered piece yet — currently none; kept for when
          thoughtPieces gains an entry again. Gated so the empty state
          doesn't leave a dead padded band before the fork graphic. */}
      {thoughtPieces.length > 0 && (
      <div className="section-pad pad-tight !pt-0">
        {thoughtPieces.map((piece) => (
          <article
            key={piece.id}
            data-reveal
            className="py-12 md:py-16 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16"
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
      )}
    </section>
  )
}
