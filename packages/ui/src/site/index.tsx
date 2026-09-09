'use client'

import type { HTMLAttributes, ReactNode } from 'react'
import { Heading, Text } from '@astryxdesign/core'
import { cn } from '../utils/cn'

export { N3wthProvider } from '../theme/N3wthProvider'
export type { N3wthProviderProps } from '../theme/N3wthProvider'
export { n3wthTheme } from '../theme/n3wthTheme'

export interface SiteContainerProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'main' | 'section' | 'article'
}

export function SiteContainer({ as: Component = 'div', className, ...props }: SiteContainerProps) {
  return <Component className={cn('n3wth-site-container', className)} {...props} />
}

export function SiteSection({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn('n3wth-site-section', className)} {...props} />
}

export interface SiteHeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'color'> {
  variant?: 'page' | 'section' | 'item'
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

const headingLevels = { page: 1, section: 2, item: 3 } as const

export function SiteHeading({ variant = 'section', level, className, children, ...props }: SiteHeadingProps) {
  return <Heading level={level ?? headingLevels[variant]} className={cn('n3wth-site-heading', `n3wth-site-heading--${variant}`, className)} {...props}>{children}</Heading>
}

export interface SiteTextProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  variant?: 'body' | 'supporting'
  as?: 'p' | 'span' | 'div'
}

export function SiteText({ variant = 'body', as = 'p', className, children, ...props }: SiteTextProps) {
  return <Text as={as} type={variant} display={as === 'span' ? 'inline' : 'block'} className={cn('n3wth-site-text', `n3wth-site-text--${variant}`, className)} {...props}>{children}</Text>
}

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode
  level?: 1 | 2
  description?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, level = 1, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <header className={cn('n3wth-site-page-header', className)} {...props}>
      <div className="n3wth-site-page-header-copy">
        <SiteHeading variant={level === 1 ? 'page' : 'section'} level={level}>{title}</SiteHeading>
        {description != null && <SiteText className="n3wth-site-description">{description}</SiteText>}
      </div>
      {actions != null && <div className="n3wth-site-actions">{actions}</div>}
    </header>
  )
}
