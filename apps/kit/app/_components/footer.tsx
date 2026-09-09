import { SiteFooter } from '@n3wth/ui/site'
import { siteUrls } from '@n3wth/site-config'
import Link from 'next/link'

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Components', href: '/components' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Registry', href: '/docs/getting-started' },
    ],
  },
  {
    title: 'Docs',
    links: [
      { label: 'Getting Started', href: '/docs/getting-started' },
      { label: 'AGENTS.md', href: '/docs/agents' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'Blog', href: '/blog' },
      {
        label: 'GitHub',
        href: 'https://github.com/n3wth/n3wth/tree/main/apps/kit',
        external: true,
      },
      { label: 'Email', href: 'mailto:hey@n3wth.com' },
    ],
  },
] as const

const familyLinks = [
  { label: 'hop.flights', href: siteUrls.hop },
  { label: 'r3', href: siteUrls.r3 },
  { label: 'garden', href: siteUrls.garden },
  { label: 'skills', href: siteUrls.skills },
  { label: 'ui', href: siteUrls.ui },
  { label: 'n3wth.com', href: siteUrls.home },
  { label: 'Email', href: 'mailto:hey@n3wth.com' },
] as const

export function Footer() {
  return (
    <SiteFooter
      brand={<Link href="/">n3wth/kit</Link>}
      links={
        <>
          {columns.map((column) =>
            column.links.map((link) => (
              <Link key={`${column.title}-${link.href}`} href={link.href}>
                {link.label}
              </Link>
            )),
          )}
          {familyLinks
            .filter((link) => link.label !== 'Email')
            .map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
        </>
      }
    >
      <p>A shadcn registry with AI context packs.</p>
      <p>© 2026 Oliver Newth</p>
    </SiteFooter>
  )
}
