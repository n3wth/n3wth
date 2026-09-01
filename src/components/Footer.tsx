import { siteConfig } from '../data/content'

/** One quiet row: copyright left, the handful of links that matter right.
    A personal site doesn't need a sitemap-style footer. */
const links = [
  { label: 'GitHub', href: siteConfig.social.github, external: true },
  { label: 'LinkedIn', href: siteConfig.social.linkedin, external: true },
  { label: 'Email', href: `mailto:${siteConfig.email}`, external: false },
  { label: 'garden', href: 'https://garden.n3wth.com', external: true },
  { label: 'kit', href: 'https://kit.n3wth.com', external: true },
  { label: 'skills', href: 'https://skills.n3wth.com', external: true },
  { label: 'r3', href: 'https://r3.n3wth.com', external: true },
  { label: 'hop', href: 'https://hop.flights', external: true },
]

export function Footer() {
  return (
    <footer className="mt-auto" style={{ borderTop: '1px solid var(--rail)' }}>
      {/* Same column + gutters as page content so text edges align */}
      <div className="frame" style={{ paddingInline: 'var(--gutter)' }}>
        <div className="py-8 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <p className="text-sm" style={{ color: 'var(--ink-dim)' }}>
            © Oliver Newth
          </p>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="footer-link text-sm"
                    {...(link.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
