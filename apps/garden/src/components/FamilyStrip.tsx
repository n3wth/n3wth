import { siteUrls } from '@n3wth/site-config'
import { site } from '@/lib/site'

const familyLinks = [
  { label: 'hop.flights', href: siteUrls.hop },
  { label: 'lunchmoney.sh', href: siteUrls.lunch },
  { label: 'r3', href: siteUrls.r3 },
  { label: 'kit', href: siteUrls.kit },
  { label: 'skills', href: siteUrls.skills },
  { label: 'ui', href: siteUrls.ui },
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
