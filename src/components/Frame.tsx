import type { ReactNode } from 'react'

/**
 * Section header: a large display headline and an optional lede.
 */
export function SectionHeader({
  title,
  lede,
}: {
  title: ReactNode
  lede?: ReactNode
}) {
  return (
    <header data-reveal className="section-pad pb-8 md:pb-12 relative">
      <div className="relative min-w-0">
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
