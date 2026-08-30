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
      <Heading
        className="display text-[length:var(--display-h1)] max-w-[18ch]"
        style={{ letterSpacing: '-0.03em', lineHeight: 1 }}
      >
        {title}
      </Heading>
      {lede && (
        <p className="t-lead mt-6 max-w-xl" style={{ color: 'var(--ink-dim)' }}>
          {lede}
        </p>
      )}
    </header>
  )
}
