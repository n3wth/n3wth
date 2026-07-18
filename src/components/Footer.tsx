import { siteConfig } from '../data/content'
import { CursorMark } from './marks'

/** n3wth.com ecosystem — current site rendered as plain text, others linked. */
const ecosystemSites = [
  { name: 'n3wth', href: 'https://n3wth.com' },
  { name: 'n3wth/skills', href: 'https://skills.n3wth.com' },
  { name: 'n3wth/ui', href: 'https://ui.n3wth.com' },
  { name: 'n3wth/garden', href: 'https://garden.n3wth.com' },
]

const connectLinks = [
  { label: 'GitHub', href: siteConfig.social.github },
  { label: 'LinkedIn', href: siteConfig.social.linkedin },
  { label: 'Email', href: `mailto:${siteConfig.email}` },
]

const currentSite = 'n3wth'

export function Footer() {
  return (
    <footer className="mt-auto">
      {/* Same column + gutters as page content so text edges align */}
      <div className="frame" style={{ paddingInline: 'var(--gutter)' }}>
        <div className="py-12 grid grid-cols-2 gap-10 md:grid-cols-[1fr_auto_auto] md:gap-20">
          <div className="col-span-2 md:col-span-1">
            <span className="brand" aria-label="n3wth">
              <span className="brand-mark shrink-0" aria-hidden="true">
                <CursorMark size={18} />
              </span>
              <span>n3wth</span>
            </span>
            <p className="mt-2 text-sm max-w-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
              I build AI products at Google and light installations after
              hours. Based in San Francisco.
            </p>
            <p className="mt-6 text-[11px] tracking-[0.04em]" style={{ color: 'var(--ink-faint)' }}>
              © Oliver Newth 2026
            </p>
          </div>

          <nav aria-label="Connect">
            <p className="label mb-3">Connect</p>
            <ul className="space-y-2">
              {connectLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="footer-link text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Ecosystem">
            <p className="label mb-3">Ecosystem</p>
            <ul className="space-y-2">
              {ecosystemSites.map((site) => (
                <li key={site.name}>
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
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
