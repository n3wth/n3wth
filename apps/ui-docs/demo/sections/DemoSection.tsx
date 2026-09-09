import { type ReactNode } from 'react'
import { SiteSection, SiteHeading, SiteText } from '@n3wth/ui/site'
import { cn } from '@n3wth/ui'

interface DemoSectionProps {
  id: string
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function DemoSection({ id, title, description, children, className }: DemoSectionProps) {
  return (
    <SiteSection id={id} className={cn('scroll-mt-20', className)}>
      <div className="mb-6">
        <SiteHeading variant="section">
          {title}
        </SiteHeading>
        {description && (
          <SiteText className="mt-2">{description}</SiteText>
        )}
      </div>
      {children}
    </SiteSection>
  )
}

interface DemoBlockProps {
  title: string
  children: ReactNode
  className?: string
}

export function DemoBlock({ title, children, className }: DemoBlockProps) {
  return (
    <div className={cn('mb-10', className)}>
      <SiteHeading variant="item" className="mb-4">
        {title}
      </SiteHeading>
      {children}
    </div>
  )
}
