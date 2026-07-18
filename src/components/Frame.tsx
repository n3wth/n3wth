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
          left the whole upper-right of every page as dead space. */}
      <div className="relative min-w-0 md:flex md:items-end md:justify-between md:gap-16">
        <Heading
          className="display text-[clamp(1.85rem,3.8vw,3.1rem)] max-w-[18ch] shrink-0"
          style={{ letterSpacing: '-0.03em', lineHeight: 1 }}
        >
          {title}
        </Heading>
        {lede && (
          <p
            className="t-lead mt-6 md:mt-0 max-w-xl md:max-w-sm md:pb-1"
            style={{ color: 'var(--ink-dim)' }}
          >
            {lede}
          </p>
        )}
      </div>
    </header>
  )
}
