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
    <div className="family-strip absolute bottom-0 inset-x-0 z-10 pointer-events-none">
      <nav
        aria-label="n3wth sites"
        className="flex justify-center items-center gap-4 py-3 pointer-events-auto"
      >
        {familyLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] tracking-[0.04em] text-[var(--color-text-disabled)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  )
}
