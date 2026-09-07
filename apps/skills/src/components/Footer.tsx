'use client'

const sites = [
  { name: 'hop.flights', href: 'https://hop.flights' },
  { name: 'r3', href: 'https://r3.n3wth.com' },
  { name: 'kit', href: 'https://kit.n3wth.com' },
  { name: 'garden', href: 'https://garden.n3wth.com' },
  { name: 'ui', href: 'https://ui.n3wth.com' },
  { name: 'n3wth.com', href: 'https://n3wth.com' },
  { name: 'Email', href: 'mailto:hey@n3wth.com' },
]

const legal = [
  { name: 'Terms', href: '/terms' },
  { name: 'Privacy', href: '/privacy' },
]

export function Footer() {
  return (
    <footer className="py-10">
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col gap-6">
        {/* Sites */}
        <nav className="flex items-center gap-4 flex-wrap">
          {sites.map((site, i) => (
            <span key={site.name} className="flex items-center gap-4">
              <a
                href={site.href}
                rel={site.href.startsWith('http') ? 'external' : undefined}
                className="text-sm hover:text-white transition-colors"
                style={{ color: 'var(--color-grey-500)' }}
              >
                {site.name}
              </a>
              {i < sites.length - 1 && (
                <span style={{ color: 'var(--color-grey-700)' }}>/</span>
              )}
            </span>
          ))}
        </nav>

        {/* Legal */}
        <nav className="flex items-center gap-3">
          {legal.map((link, i) => (
            <span key={link.name} className="flex items-center gap-3">
              <a
                href={link.href}
                className="transition-colors"
                style={{
                  fontSize: '11px',
                  color: 'var(--color-grey-600)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-grey-400)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-grey-600)'}
              >
                {link.name}
              </a>
              {i < legal.length - 1 && (
                <span style={{ fontSize: '11px', color: 'var(--color-grey-700)' }}>/</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </footer>
  )
}
