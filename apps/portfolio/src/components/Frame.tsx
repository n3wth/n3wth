import type { ReactNode } from 'react'
import { PageHeader } from '@n3wth/ui/site'

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
  return (
    <PageHeader data-reveal className="section-pad" title={title} description={lede} actions={action} level={Heading === 'h1' ? 1 : 2} />
  )
}
