'use client'

import { SiteFooter } from '@n3wth/ui/site'
import { siteUrls } from '@n3wth/site-config'


const sites = [
  { name: 'hop.flights', href: siteUrls.hop },
  { name: 'r3', href: siteUrls.r3 },
  { name: 'kit', href: siteUrls.kit },
  { name: 'garden', href: siteUrls.garden },
  { name: 'ui', href: siteUrls.ui },
  { name: 'n3wth.com', href: siteUrls.home },
  { name: 'Email', href: 'mailto:hey@n3wth.com' },
]

const legal = [
  { name: 'Terms', href: '/terms' },
  { name: 'Privacy', href: '/privacy' },
]

export function Footer() {
  return (
    <SiteFooter
      brand={<a href="/">n3wth/skills</a>}
      links={<>{[...sites, ...legal].map(site => <a key={site.name} href={site.href} rel={site.href.startsWith('http') ? 'external' : undefined}>{site.name}</a>)}</>}
    >
      © {new Date().getFullYear()} n3wth
    </SiteFooter>
  )
}
