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
 * Blueprint section header: a mono index `[ 01 ] — Title`, a large display
 * headline, and optional lede. Children render an optional geometric mark.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  lede,
  mark,
}: {
  index: string
  eyebrow: string
  title: ReactNode
  lede?: ReactNode
  mark?: ReactNode
}) {
  return (
    <header className="section-pad pb-8 md:pb-12">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p data-reveal className="reveal index mb-5">
            [ {index} ] <span className="mx-1">—</span> {eyebrow}
          </p>
          <h2
            data-reveal
            className="reveal display text-[clamp(2rem,6.5vw,4.5rem)] max-w-[14ch]"
          >
            {title}
          </h2>
          {lede && (
            <p
              data-reveal
              className="reveal mt-6 max-w-xl text-base md:text-lg leading-relaxed"
              style={{ color: 'var(--dim)' }}
            >
              {lede}
            </p>
          )}
        </div>
        {mark && (
          <div
            data-reveal
            className="reveal hidden sm:block shrink-0"
            style={{ color: 'var(--faint)' }}
          >
            {mark}
          </div>
        )}
      </div>
    </header>
  )
}
