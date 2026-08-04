import type { ReactNode } from 'react'

/**
 * Section header: a large display headline and an optional lede.
 * Pass as="h1" on a route's first section — every page needs a
 * top-level heading, not an outline that starts at h2.
 */
export function SectionHeader({
  title,
  lede,
  as: Heading = 'h2',
}: {
  title: ReactNode
  lede?: ReactNode
  as?: 'h1' | 'h2'
}) {
  return (
    <header data-reveal className="section-pad pb-8 md:pb-12 relative">
      {/* Title left, lede right: stacking both in one narrow left column
          left the whole upper-right of every page as dead space.

          items-start, not items-end. Bottom-aligning the two columns tied the
          title's vertical position to the length of the lede beside it, so the
          page title landed 39px lower on /library than on /work and visibly
          jumped as you moved between pages. Top-aligned, the title sits at the
          same height on every route and the lede grows downward from a fixed
          first line. */}
      <div className="relative min-w-0 md:flex md:items-start md:justify-between md:gap-16">
        <Heading
          className="display text-[clamp(1.85rem,3.8vw,3.1rem)] max-w-[18ch] shrink-0"
          style={{ letterSpacing: '-0.03em', lineHeight: 1 }}
        >
          {title}
        </Heading>
        {lede && (
          /* md:mt-1 optically levels the lede's first line with the title's
             cap height — the display face sits on a tighter line box, so a
             hard top alignment reads as the lede riding slightly high. */
          <p
            className="t-lead mt-6 md:mt-1 max-w-xl md:max-w-sm"
            style={{ color: 'var(--ink-dim)' }}
          >
            {lede}
          </p>
        )}
      </div>
    </header>
  )
}
