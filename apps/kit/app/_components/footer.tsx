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
      { label: 'Cursor', href: '/docs/cursor' },
      { label: 'AGENTS.md', href: '/docs/agents' },
      { label: 'v0', href: '/docs/v0' },
      { label: 'Lovable', href: '/docs/lovable' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'GitHub', href: 'https://github.com/n3wth/kit', external: true },
      { label: 'Email', href: 'mailto:hey@n3wth.com' },
    ],
  },
] as const

const familyLinks = [
  { label: 'hop.flights', href: 'https://hop.flights' },
  { label: 'r3', href: 'https://r3.n3wth.com' },
  { label: 'garden', href: 'https://garden.n3wth.com' },
  { label: 'skills', href: 'https://skills.n3wth.com' },
  { label: 'ui', href: 'https://ui.n3wth.com' },
  { label: 'n3wth.com', href: 'https://n3wth.com' },
  { label: 'Email', href: 'mailto:hey@n3wth.com' },
] as const

export function Footer() {
  return (
    <footer className="border-t border-rail bg-bg-soft">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="text-sm font-semibold text-ink">
              n3wth/kit
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-faint">
              A shadcn registry with AI context packs.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-medium uppercase tracking-widest text-ink-label">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-ink-dim transition-colors hover:text-ink"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-ink-dim transition-colors hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Family row */}
        <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-rail pt-6">
          {familyLinks.map((link, i) => (
            <span key={link.label} className="flex items-center gap-4">
              <a
                href={link.href}
                target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                className="text-xs text-ink-faint transition-colors hover:text-ink"
              >
                {link.label}
              </a>
              {i < familyLinks.length - 1 && (
                <span className="text-ink-faint/50">·</span>
              )}
            </span>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex items-center justify-between pt-6">
          <p className="text-xs text-ink-faint">
            &copy; 2026 Oliver Newth
          </p>
          <p className="text-xs text-ink-faint">n3wth/kit</p>
        </div>
      </div>
    </footer>
  )
}
