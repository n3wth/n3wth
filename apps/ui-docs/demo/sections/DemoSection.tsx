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
          <div className="mt-2"><SiteText>{description}</SiteText></div>
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
      <div className="mb-4">
        <SiteHeading variant="item">{title}</SiteHeading>
      </div>
      {children}
    </div>
  )
}
