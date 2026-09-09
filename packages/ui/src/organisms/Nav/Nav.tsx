import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { SiteNavigation } from '../../site'
import { ThemeToggle } from '../../molecules/ThemeToggle'

export interface NavItem {
  label: string
  href: string
  isActive?: boolean
  external?: boolean
}

export interface NavProps extends HTMLAttributes<HTMLElement> {
  logo?: ReactNode
  logoHref?: string
  items?: NavItem[]
  theme?: 'dark' | 'light'
  onThemeToggle?: () => void
  showThemeToggle?: boolean
  fixed?: boolean
  hideOnScroll?: boolean
}

/** @deprecated Use SiteNavigation from @n3wth/ui/site. */
export function Nav({ logo, logoHref = '/', items = [], theme = 'dark', onThemeToggle,
  showThemeToggle = true, fixed = false, hideOnScroll: _hideOnScroll, className, style, ...props
}: NavProps) {
  return <SiteNavigation {...props} className={cn(fixed && 'fixed', className)}
    style={{ position: fixed ? 'fixed' : 'relative', ...style }}
    brand={<a href={logoHref}>{logo}</a>}
    links={items.map(item => <a key={item.href} href={item.href}
      aria-current={item.isActive ? 'page' : undefined}
      target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined}
    >{item.label}</a>)}
    actions={showThemeToggle && onThemeToggle ? <ThemeToggle theme={theme} onToggle={onThemeToggle} /> : undefined}
  />
}
