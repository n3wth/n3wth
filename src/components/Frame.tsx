import type { ReactNode } from 'react'

/** Corner ticks for a bordered region. */
export function CornerTicks() {
  return (
    <>
      <span className="tick tick-tl" aria-hidden="true" />
      <span className="tick tick-tr" aria-hidden="true" />
      <span className="tick tick-bl" aria-hidden="true" />
      <span className="tick tick-br" aria-hidden="true" />
    </>
  )
}

/** Hairline horizontal rule spanning the frame, with corner ticks at the joins. */
export function Rule() {
  return (
    <div className="rule" role="separator" aria-hidden="true">
      <span className="tick tick-tl" />
      <span className="tick tick-tr" />
    </div>
  )
}

/**
 * Section header: a quiet sans eyebrow, a large display headline, and an
 * optional lede. The section index renders as a huge "ghost" numeral on the
 * right — a landmark that makes each chapter visually distinct while
 * scrolling, and that carries the page's day→night narrative: daylight
 * chapters get stroke-only wireframe numerals (blueprints), chapters after
 * dark get numerals filled with light (`lit`).
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  lede,
  lit = false,
}: {
  index?: string
  eyebrow: string
  title: ReactNode
  lede?: ReactNode
  /** After-dark chapters: numeral filled with light instead of wireframe. */
  lit?: boolean
}) {
  return (
    <header data-reveal className="section-pad pb-8 md:pb-12 relative">
      {index && (
        <span
          className={`ghost-index ${lit ? 'ghost-index--lit' : ''}`}
          aria-hidden="true"
        >
          {index}
        </span>
      )}
      <div className="relative min-w-0">
        <p className="eyebrow mb-5">
          {index && (
            <>
              <span className="index">{index}</span>
              <span className="mx-3" style={{ color: 'var(--ink-faint)' }} aria-hidden="true">
                ·
              </span>
            </>
          )}
          {eyebrow}
        </p>
        <h2
          className="display text-[clamp(1.85rem,3.8vw,3.1rem)] max-w-[18ch]"
          style={{ letterSpacing: '-0.03em', lineHeight: 1 }}
        >
          {title}
        </h2>
        {lede && (
          <p
            className="t-lead mt-6 max-w-xl"
            style={{ color: 'var(--ink-dim)' }}
          >
            {lede}
          </p>
        )}
      </div>
    </header>
  )
}
