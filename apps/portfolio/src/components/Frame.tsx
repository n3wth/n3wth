import type { ReactNode } from 'react'
import { PageHeader } from '@n3wth/ui/site'
import './sectionHero.css'

/**
 * Section header: a large display headline and an optional lede.
 * Pass as="h1" on a route's first section — every page needs a
 * top-level heading, not an outline that starts at h2.
 */
export function SectionHeader({
  title,
  lede,
  action,
  visual,
  as: Heading = 'h2',
}: {
  title: ReactNode
  lede?: ReactNode
  action?: ReactNode
  visual?: ReactNode
  as?: 'h1' | 'h2'
}) {
  const header = (
    <PageHeader
      className={`site-content-gutter${Heading === 'h1' ? ' portfolio-section-hero' : ''}`}
      title={Heading === 'h1' ? <span className="portfolio-section-title">{title}</span> : title}
      description={lede}
      actions={action}
      level={Heading === 'h1' ? 1 : 2}
    />
  )
  return visual ? (
    <div className="portfolio-section-stage">
      {header}
      <div className="portfolio-section-visual" aria-hidden="true">{visual}</div>
    </div>
  ) : header
}
