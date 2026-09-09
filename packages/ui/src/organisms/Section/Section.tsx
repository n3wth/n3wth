import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { SiteContainer, SiteSection, SiteHeading, SiteText } from '../../site'

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  spacing?: 'none' | 'sm' | 'md' | 'lg'
  container?: boolean
}

export function Section({
  children,
  size = 'md',
  spacing = 'md',
  container = true,
  className,
  ...props
}: SectionProps) {
  const sizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    full: 'max-w-none',
  }

  const spacings = {
    none: 'py-0',
    sm: 'py-12 md:py-16',
    md: 'py-16 md:py-24',
    lg: 'py-24 md:py-32',
  }

  // Add scroll-margin-top when section has an id for anchor links
  const hasId = Boolean(props.id)

  return (
    <SiteSection
      className={cn(spacings[spacing], hasId && 'scroll-mt-20', className)}
      {...props}
    >
      {container ? (
        <SiteContainer className={cn('mx-auto', sizes[size])}>
          {children}
        </SiteContainer>
      ) : (
        children
      )}
    </SiteSection>
  )
}

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  align?: 'left' | 'center'
}

export function SectionHeader({
  title,
  description,
  align = 'left',
  className,
  ...props
}: SectionHeaderProps) {
  const alignments = {
    left: 'text-left',
    center: 'text-center mx-auto',
  }

  return (
    <div
      className={cn('max-w-2xl mb-12', alignments[align], className)}
      {...props}
    >
      <SiteHeading>
        {title}
      </SiteHeading>
      {description && (
        <SiteText className="mt-4">
          {description}
        </SiteText>
      )}
    </div>
  )
}
