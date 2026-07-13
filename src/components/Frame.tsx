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
 * optional lede. Children render an optional geometric mark that diagrams the
 * adjacent concept.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  lede,
  mark,
}: {
  index?: string
  eyebrow: string
  title: ReactNode
  lede?: ReactNode
  mark?: ReactNode
}) {
  return (
    <header className="section-pad pb-8 md:pb-12">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="eyebrow mb-5">
            {index && (
              <>
                <span className="index">{index}</span>
                <span className="mx-3" style={{ color: 'var(--rail-strong)' }} aria-hidden="true">
                  /
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
        {mark && (
          <div
            className="hidden sm:block shrink-0"
            style={{ color: 'var(--ink-faint)' }}
          >
            {mark}
          </div>
        )}
      </div>
    </header>
  )
}
