import { site } from '@/lib/site'

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
    <footer className="mt-auto" style={{ borderTop: '1px solid var(--color-border)' }}>
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="py-8 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <p className="text-sm text-[var(--color-text-secondary)]">
            © {new Date().getFullYear()} Oliver Newth
          </p>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
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
