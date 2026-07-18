import { Collapsible } from '@astryxdesign/core/Collapsible'
import { SectionHeader } from '../Frame'
import { thoughtPieces } from '../../data/thinking'

/* Positions read as a scannable index: title + thesis visible, the
   numbered reasons folded into an Astryx Collapsible per piece. Keeps the
   section at one screen instead of three stacked essays. */
export function Thinking() {
  return (
    <section id="thinking" aria-label="Thinking">
      <SectionHeader
        title="What I believe about production AI"
        lede="Three positions from shipping AI at scale and running an agent team in production. Open each one for the reasons."
      />

      <div className="section-pad pad-tight !pt-0">
        <div className="space-y-4">
          {thoughtPieces.map((piece) => (
            <article
              key={piece.id}
              data-reveal
              className="cell relative px-5 py-7 md:px-8 md:py-8"
            >
              <div className="max-w-3xl">
                <span className="eyebrow block mb-3">{piece.category}</span>
                <div>
                  <h3
                    className="display text-xl md:text-2xl mb-3"
                    style={{ letterSpacing: '-0.02em' }}
                  >
                    {piece.title}
                  </h3>
                  <p
                    className="text-sm md:text-base leading-relaxed mb-5"
                    style={{ color: 'var(--ink-dim)' }}
                  >
                    {piece.description}
                  </p>

                  <Collapsible trigger="The reasons" defaultIsOpen={false}>
                    <ul className="space-y-4 pt-3 pb-1">
                      {piece.insights.map((insight, idx) => (
                        <li
                          key={idx}
                          className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 text-sm leading-relaxed"
                          style={{ color: 'var(--ink-dim)' }}
                        >
                          <span className="index pt-0.5">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </Collapsible>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
