import type { ReactNode } from 'react'

/**
 * Section header: a large display headline and an optional lede.
 * Pass as="h1" on a route's first section — every page needs a
 * top-level heading, not an outline that starts at h2.
 */
export function SectionHeader({
  title,
  lede,
  action,
  as: Heading = 'h2',
}: {
  title: ReactNode
  lede?: ReactNode
  action?: ReactNode
  as?: 'h1' | 'h2'
}) {
  const heading = (
    <Heading
      className={`display ${Heading === 'h1' ? 'page-title' : 'text-[length:var(--display-h1)]'} max-w-[18ch]`}
      style={{ letterSpacing: '-0.03em', lineHeight: 1 }}
    >
      {title}
    </Heading>
  )
  return (
    <header data-reveal className="section-pad pb-8 md:pb-12 relative">
      {action ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          {heading}
          {action}
        </div>
      ) : heading}
      {lede && (
        <p className="t-lead mt-6 max-w-xl" style={{ color: 'var(--ink-dim)', textWrap: 'balance' }}>
          {lede}
        </p>
      )}
    </header>
  )
}
