import type { ReactNode } from 'react'
import { PageHeader, SiteContainer, SiteSection } from '@n3wth/ui/site'

/** Content-only utility routes share the same page structure as the site. */
export function UtilityPage({ title, description, actions, children, label }: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  label: string
}) {
  return <SiteContainer as="section" aria-label={label}>
    <PageHeader title={title} description={description} actions={actions} />
    {children && <SiteSection>{children}</SiteSection>}
  </SiteContainer>
}
