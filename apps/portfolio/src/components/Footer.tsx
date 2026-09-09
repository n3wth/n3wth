import { siteConfig } from '../data/content'
import { siteUrls } from '../data/sites'
import { SiteFooter } from '@n3wth/ui/site'

/** A compact row of social and project links. */
const links = [
  { label: 'GitHub', href: siteConfig.social.github, external: true },
  { label: 'LinkedIn', href: siteConfig.social.linkedin, external: true },
  { label: 'hop', href: siteUrls.hop, external: true },
  { label: 'r3', href: siteUrls.r3, external: true },
  { label: 'kit', href: siteUrls.kit, external: true },
  { label: 'skills', href: siteUrls.skills, external: true },
  { label: 'garden', href: siteUrls.garden, external: true },
]

export function Footer() {
  return (
    <SiteFooter data-nosnippet brand={<a href="/">n3wth</a>} links={<>
              {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    {...(link.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {link.label}
                  </a>
              ))}
    </>} />
  )
}
