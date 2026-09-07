import { site } from '@/lib/site'

const familyLinks = [
  { label: 'hop.flights', href: 'https://hop.flights' },
  { label: 'r3', href: 'https://r3.n3wth.com' },
  { label: 'kit', href: 'https://kit.n3wth.com' },
  { label: 'skills', href: 'https://skills.n3wth.com' },
  { label: 'ui', href: 'https://ui.n3wth.com' },
  { label: 'n3wth.com', href: site.parentUrl },
]

export function FamilyStrip() {
  return (
    <div className="family-strip">
      <nav
        aria-label="n3wth sites"
        className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 px-5 py-3"
      >
        {familyLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center whitespace-nowrap text-xs text-[var(--color-text-disabled)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  )
}
