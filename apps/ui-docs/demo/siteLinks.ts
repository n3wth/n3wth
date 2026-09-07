import { siteUrls } from '@n3wth/site-config'
import type { FooterLink, FooterSite } from '@n3wth/ui'

export const siteLinks: FooterSite[] = [
  { name: 'hop.flights', href: siteUrls.hop },
  { name: 'r3', href: siteUrls.r3 },
  { name: 'kit', href: siteUrls.kit },
  { name: 'garden', href: siteUrls.garden },
  { name: 'skills', href: siteUrls.skills },
  { name: 'n3wth.com', href: siteUrls.home },
]

export const legalLinks: FooterLink[] = [
  { label: 'Email', href: 'mailto:hey@n3wth.com' },
  { label: 'Privacy', href: `${siteUrls.home}/privacy` },
]
