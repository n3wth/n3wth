import { useRef } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { SectionHeader } from '../Frame'
import { GridMark } from '../marks'
import { frameworks } from '../../data/content'

export function Frameworks() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  return (
    <section ref={ref} id="frameworks" aria-label="Frameworks">
      <SectionHeader
        eyebrow="After a decade of building"
        title="Four things I believe"
        lede="Principles I've developed shipping AI products at Google, Meta, and Microsoft."
        mark={<GridMark size={56} />}
      />

      <div className="section-pad pad-tight !pt-0">
        <ol style={{ borderTop: '1px solid var(--rail)' }}>
          {frameworks.map((fw, i) => (
            <li
              key={fw.id}
              data-reveal
              className="reveal grid gap-3 md:grid-cols-[7rem_minmax(0,1fr)] md:gap-10 py-8 md:py-10"
              style={{ borderBottom: '1px solid var(--rail)' }}
            >
              <span className="index">{String(i + 1).padStart(2, '0')}</span>
              <div className="max-w-2xl">
                <h3 className="display text-[clamp(1.4rem,3.5vw,2.25rem)] mb-3">
                  {fw.title}
                </h3>
                <p
                  className="text-sm md:text-lg leading-relaxed"
                  style={{ color: 'var(--ink-dim)' }}
                >
                  {fw.tagline}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
