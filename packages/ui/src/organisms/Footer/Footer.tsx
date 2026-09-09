import { type HTMLAttributes, type ReactNode } from 'react'
import { SiteFooter, SiteHeading, SiteText } from '../../site'

export interface FooterLink {
  label: string
  href: string
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

export interface FooterSite {
  name: string
  href: string
}

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  /** Site ecosystem links. Defaults to n3wth ecosystem. */
  sites?: FooterSite[]
  /** Name of the current site to highlight (renders as text instead of link). */
  currentSite?: string
  /** Legal/bottom links. Defaults to Terms + Privacy. */
  legalLinks?: FooterLink[]
  /** Copyright text. Defaults to current year + Oliver Newth. */
  copyright?: string
  /** Optional logo for rich footer layout (shows sections grid above sites bar). */
  logo?: ReactNode
  /** Optional description shown below logo in rich layout. */
  description?: string
  /** Optional section columns for rich footer layout. */
  sections?: FooterSection[]
  /** Optional social icon links shown below description in rich layout. */
  socialLinks?: Array<{
    label: string
    href: string
    icon: ReactNode
  }>
  /** @deprecated Use legalLinks instead. */
  bottomLinks?: FooterLink[]
}

/** @deprecated Use SiteFooter defaults from @n3wth/ui/site. */
export function Footer({ sites = [], currentSite, legalLinks, copyright, logo,
  description, sections = [], socialLinks = [], bottomLinks, ...props
}: FooterProps) {
  const legal = legalLinks ?? bottomLinks ?? []
  return <SiteFooter {...props} brand={logo}
    legalLinks={legal.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}>
    {(description || copyright || sections.length > 0 || sites.length > 0 || socialLinks.length > 0) && <>
      {description && <SiteText variant="supporting">{description}</SiteText>}
      {sections.map(section => <div key={section.title}>
        <SiteHeading variant="item">{section.title}</SiteHeading>
        <div className="n3wth-site-footer-links">{section.links.map(link =>
          <a key={link.href} href={link.href}>{link.label}</a>
        )}</div>
      </div>)}
      <div className="n3wth-site-footer-links">
        {sites.map(site => site.name === currentSite ? <span key={site.name}>{site.name}</span> :
          <a key={site.name} href={site.href}>{site.name}</a>)}
        {socialLinks.map(link => <a key={link.href} href={link.href} aria-label={link.label}
          target="_blank" rel="noopener noreferrer">{link.icon}</a>)}
      </div>
      {copyright && <SiteText variant="supporting">{copyright}</SiteText>}
    </>}
  </SiteFooter>
}
