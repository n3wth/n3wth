import { siteConfig } from '../data/content'

/** A compact row of social and project links. */
const links = [
  { label: 'GitHub', href: siteConfig.social.github, external: true },
  { label: 'LinkedIn', href: siteConfig.social.linkedin, external: true },
  { label: 'hop', href: 'https://hop.flights', external: true },
  { label: 'r3', href: 'https://r3.n3wth.com', external: true },
  { label: 'kit', href: 'https://kit.n3wth.com', external: true },
  { label: 'skills', href: 'https://skills.n3wth.com', external: true },
  { label: 'garden', href: 'https://garden.n3wth.com', external: true },
]

export function Footer() {
  return (
    <footer className="mt-auto" style={{ borderTop: '1px solid var(--rail)' }} data-nosnippet>
      {/* Same column + gutters as page content so text edges align */}
      <div className="frame" style={{ paddingInline: 'var(--gutter)' }}>
        <div className="py-8">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              {links.map((link) => (
                <li key={link.label}>
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
