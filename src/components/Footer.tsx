import { siteConfig } from '../data/content'

const sites = [
  { name: 'n3wth', href: 'https://n3wth.com', current: true },
  { name: 'Skills', href: 'https://skills.n3wth.com' },
  { name: 'Art', href: 'https://newth.art' },
]

const social = [
  { name: 'GitHub', href: siteConfig.social.github },
  { name: 'LinkedIn', href: siteConfig.social.linkedin },
]

export function Footer() {
  return (
    <footer className="py-10 px-6 md:px-12 border-t" style={{ borderColor: 'var(--glass-border)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Sites */}
        <div className="flex items-center gap-4">
          {sites.map((site, i) => (
            <span key={site.name} className="flex items-center gap-4">
              <a
                href={site.href}
                className="text-sm transition-colors"
                style={{ color: site.current ? 'var(--color-white)' : 'var(--color-grey-500)' }}
                {...(!site.current && { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {site.name}
              </a>
              {i < sites.length - 1 && (
                <span style={{ color: 'var(--color-grey-700)' }}>/</span>
              )}
            </span>
          ))}
        </div>

        {/* Social + Copyright */}
        <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-grey-500)' }}>
          {social.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              {link.name}
            </a>
          ))}
          <span style={{ color: 'var(--color-grey-700)' }}>/</span>
          <span style={{ color: 'var(--color-grey-600)' }}>{new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}
