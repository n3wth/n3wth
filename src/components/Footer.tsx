import { siteConfig } from '../data/content'
import { CursorMark } from './marks'

/** n3wth.com ecosystem — current site rendered as plain text, others linked. */
const ecosystemSites = [
  { name: 'n3wth', href: 'https://n3wth.com' },
  { name: 'n3wth/skills', href: 'https://skills.n3wth.com' },
  { name: 'n3wth/ui', href: 'https://ui.n3wth.com' },
  { name: 'n3wth/garden', href: 'https://garden.n3wth.com' },
]

const legalLinks = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
]

const connectLinks = [
  { label: 'GitHub', href: siteConfig.social.github },
  { label: 'LinkedIn', href: siteConfig.social.linkedin },
  { label: 'newth.art', href: siteConfig.artSite },
  { label: 'Email', href: `mailto:${siteConfig.email}` },
]

const currentSite = 'n3wth'

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--rail)', background: 'var(--bg)' }}>
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
            <div className="md:col-span-2 lg:col-span-2">
              <span className="brand" aria-label="n3wth">
                <span className="brand-mark shrink-0" aria-hidden="true">
                  <CursorMark size={20} />
                </span>
                <span>n3wth</span>
              </span>
              <p className="mt-4 text-sm max-w-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
                I build AI products at Google and large LED art on the side. Based in San
                Francisco.
              </p>
            </div>

            <div>
              <h4 className="eyebrow mb-4">Connect</h4>
              <ul className="space-y-3">
                {connectLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="footer-link text-sm">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-10" style={{ borderTop: '1px solid var(--rail)' }}>
          <nav className="flex flex-wrap items-center gap-4" aria-label="n3wth sites">
            {ecosystemSites.map((site, i) => (
              <span key={site.name} className="flex items-center gap-4">
                {site.name === currentSite ? (
                  <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                    {site.name}
                  </span>
                ) : (
                  <a
                    href={site.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link-muted text-sm"
                  >
                    {site.name}
                  </a>
                )}
                {i < ecosystemSites.length - 1 && (
                  <span aria-hidden="true" style={{ color: 'var(--rail-strong)' }}>
                    /
                  </span>
                )}
              </span>
            ))}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
              © Oliver Newth 2026
            </p>
            <nav className="flex items-center gap-4 text-xs" aria-label="Legal">
              {legalLinks.map((link, i) => (
                <span key={link.href} className="flex items-center gap-4">
                  <a href={link.href} className="footer-link">
                    {link.label}
                  </a>
                  {i < legalLinks.length - 1 && (
                    <span aria-hidden="true" style={{ color: 'var(--rail-strong)' }}>
                      /
                    </span>
                  )}
                </span>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
