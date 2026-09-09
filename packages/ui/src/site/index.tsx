'use client'

import { useEffect, useId, useRef, useState, type ComponentProps, type HTMLAttributes, type ReactNode } from 'react'
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

export function SiteSection({ className, ...props }: ComponentProps<'section'>) {
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
  aside?: ReactNode
}

export function PageHeader({ title, level = 1, description, actions, aside, className, ...props }: PageHeaderProps) {
  return (
    <header className={cn('n3wth-site-page-header', aside != null && 'n3wth-site-page-header--split', className)} {...props}>
      <div className="n3wth-site-page-header-copy">
        <SiteHeading variant={level === 1 ? 'page' : 'section'} level={level}>{title}</SiteHeading>
        {description != null && <SiteText className="n3wth-site-description">{description}</SiteText>}
        {aside != null && actions != null && <div className="n3wth-site-actions">{actions}</div>}
      </div>
      {aside == null && actions != null && <div className="n3wth-site-actions">{actions}</div>}
      {aside != null && <div className="n3wth-site-page-header-aside">{aside}</div>}
    </header>
  )
}

export interface SiteNavigationProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  brand: ReactNode
  links: ReactNode
  actions?: ReactNode
  navigationLabel?: string
  navigationId?: string
  menuLabel?: string
}

/** Router links remain app-owned; layout and disclosure behavior live here. */
export function SiteNavigation({ brand, links, actions, navigationLabel = 'Primary', navigationId, menuLabel = 'Open menu', className, ...props }: SiteNavigationProps) {
  const [open, setOpen] = useState(false)
  const generatedId = useId()
  const menuId = navigationId ?? `site-navigation-${generatedId}`
  const button = useRef<HTMLButtonElement>(null)
  const header = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    header.current?.querySelector<HTMLAnchorElement>('.n3wth-site-navigation-links a')?.focus()
    const dismiss = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  return (
    <header {...props} ref={header} className={cn('n3wth-site-navigation', className)}>
      <div className="n3wth-site-navigation-island">
        <div className="n3wth-site-navigation-brand" onClick={() => setOpen(false)}>{brand}</div>
        <nav id={menuId} aria-label={navigationLabel} className="n3wth-site-navigation-links" data-open={open} onClick={(event) => {
          if ((event.target as Element).closest('a')) setOpen(false)
        }}>{links}</nav>
        <div className="n3wth-site-navigation-actions" onClick={() => setOpen(false)}>{actions}</div>
        <button ref={button} type="button" className="n3wth-site-navigation-toggle" aria-label={open ? 'Close menu' : menuLabel} aria-controls={menuId} aria-expanded={open} onClick={() => setOpen(value => !value)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
    </header>
  )
}

export interface SiteFooterProps extends HTMLAttributes<HTMLElement> {
  brand?: ReactNode
  links?: ReactNode
  sourceHref?: string
  legalLinks?: ReactNode
}

export function SiteFooter({ brand = <a href="https://n3wth.com">Oliver Newth</a>, links, sourceHref = 'https://github.com/n3wth/n3wth', legalLinks, children, className, ...props }: SiteFooterProps) {
  const footerLinks = links ?? <>
    <a href="https://n3wth.com/contact">Contact</a>
    <a href={sourceHref}>GitHub</a>
    {legalLinks}
  </>
  return <footer {...props} className={cn('n3wth-site-footer', className)}>
    <SiteContainer>
      <div className="n3wth-site-footer-row">
        {brand != null && <div className="n3wth-site-footer-brand">{brand}</div>}
        <nav aria-label="Footer" className="n3wth-site-footer-links">{footerLinks}</nav>
      </div>
      {children != null && <div className="n3wth-site-footer-meta">{children}</div>}
    </SiteContainer>
  </footer>
}
