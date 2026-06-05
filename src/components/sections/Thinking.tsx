import { SectionHeader } from '../Frame'
import { NodesMark } from '../marks'
import { thoughtPieces } from '../../data/thinking'

export function Thinking() {
  return (
    <section id="thinking" aria-label="Thinking">
      <SectionHeader
        eyebrow="Point of view"
        title="What I believe about production AI"
        lede="Two positions I've arrived at after a decade shipping AI at scale — and the specific, hard-won reasons behind each."
        mark={<NodesMark size={56} />}
      />

      <div className="section-pad pad-tight !pt-0">
        <div style={{ borderTop: '1px solid var(--rail)' }}>
        {thoughtPieces.map((piece) => (
          <article
            key={piece.id}
            className="relative py-10 md:py-14"
            style={{ borderBottom: '1px solid var(--rail)' }}
          >
            <div className="grid gap-6 md:grid-cols-[7rem_minmax(0,1fr)] md:gap-10">
              <div className="flex md:flex-col items-baseline md:items-start gap-4 md:gap-3 md:pt-2">
                <span className="eyebrow">
                  {piece.category}
                </span>
              </div>

              <div className="max-w-3xl">
                <h3 className="display text-[clamp(1.6rem,4vw,2.75rem)] mb-5">
                  {piece.title}
                </h3>
                <p
                  className="text-base md:text-lg leading-relaxed mb-7"
                  style={{ color: 'var(--ink-dim)' }}
                >
                  {piece.description}
                </p>

                <ul className="space-y-4">
                  {piece.insights.map((insight, idx) => (
                    <li
                      key={idx}
                      className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 text-sm md:text-base leading-relaxed"
                      style={{ color: 'var(--ink-dim)' }}
                    >
                      <span className="index pt-1">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
        </div>
      </div>
    </section>
  )
}
