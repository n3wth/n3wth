import { site } from '@/lib/site'
import { SiteFooter as SharedSiteFooter } from '@n3wth/ui/site'

/* One quiet row, matching n3wth.com's footer: copyright left, the
   handful of links that matter right. Same idiom across the ecosystem. */
const links = [
  { label: 'Notes', href: '/notes', external: false },
  { label: 'Graph', href: '/graph', external: false },
  { label: 'Groves', href: '/tags', external: false },
  { label: 'Random note', href: '/random', external: false },
  { label: 'Contact', href: 'mailto:hey@n3wth.com', external: false },
  { label: 'n3wth.com', href: site.parentUrl, external: true },
]

export function SiteFooter() {
  return (
    <SharedSiteFooter brand={<a href="/">n3wth/garden</a>} links={<>
              {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    {...(link.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {link.label}
                  </a>
              ))}
    </>}>© {new Date().getFullYear()} Oliver Newth</SharedSiteFooter>
  )
}
