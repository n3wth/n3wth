import { useRef } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { SectionHeader } from '../Frame'
import { NodesMark } from '../marks'
import { thoughtPieces } from '../../data/thinking'

export function Thinking() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  return (
    <section ref={ref} id="thinking" aria-label="Thinking">
      <SectionHeader
        index="03"
        eyebrow="Thinking"
        title="Where trust meets craft"
        lede="Writing from the intersection of production AI, creative practice, and the hard-won lessons of shipping at scale."
        mark={<NodesMark size={56} />}
      />

      <div className="section-pad !pt-0 space-y-px" style={{ background: 'var(--rail)' }}>
        {thoughtPieces.map((piece, i) => (
          <article
            key={piece.id}
            data-reveal
            className="reveal relative"
            style={{ background: 'var(--canvas)', paddingTop: '2.5rem', paddingBottom: '2.5rem' }}
          >
            <div className="grid gap-6 md:grid-cols-[7rem_minmax(0,1fr)] md:gap-10">
              <div className="flex md:flex-col items-baseline md:items-start gap-4 md:gap-3">
                <span className="index">{String(i + 1).padStart(2, '0')}</span>
                <span className="eyebrow" style={{ color: 'var(--signal)' }}>
                  {piece.category}
                </span>
              </div>

              <div className="max-w-3xl">
                <h3 className="display text-[clamp(1.6rem,4vw,2.75rem)] mb-5">
                  {piece.title}
                </h3>
                <p
                  className="text-base md:text-lg leading-relaxed mb-7"
                  style={{ color: 'var(--dim)' }}
                >
                  {piece.description}
                </p>

                <ul className="space-y-4">
                  {piece.insights.map((insight, idx) => (
                    <li
                      key={idx}
                      className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 text-sm md:text-base leading-relaxed"
                      style={{ color: 'var(--dim)' }}
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
    </section>
  )
}
