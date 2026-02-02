const sites = [
  { name: 'n3wth', href: 'https://n3wth.com', current: true },
  { name: 'Skills', href: 'https://skills.n3wth.com' },
  { name: 'UI', href: 'https://ui.n3wth.com' },
  { name: 'Garden', href: 'https://garden.n3wth.com' },
]

const legal = [
  { name: 'Terms', href: '/terms' },
  { name: 'Privacy', href: '/privacy' },
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
                className="text-sm transition-colors hover:text-white"
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

        {/* Legal */}
        <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-grey-500)' }}>
          {legal.map((link, i) => (
            <span key={link.name} className="flex items-center gap-4">
              <a
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.name}
              </a>
              {i < legal.length - 1 && (
                <span style={{ color: 'var(--color-grey-700)' }}>/</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
