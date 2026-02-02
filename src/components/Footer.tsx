import { siteConfig } from '../data/content'

export function Footer() {
  return (
    <footer className="py-12 md:py-16 px-6 md:px-12">
      <div className="flex flex-col gap-8">
        {/* Site links */}
        <div className="flex flex-wrap items-center gap-6 md:gap-8">
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--color-grey-600)' }}>
            Sites
          </span>
          <a
            href="https://n3wth.com"
            className="text-sm link-hover focus-ring rounded"
            style={{ color: 'var(--color-grey-300)' }}
          >
            n3wth.com
          </a>
          <a
            href="https://skills.n3wth.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm link-hover focus-ring rounded"
            style={{ color: 'var(--color-grey-400)' }}
          >
            Skills
          </a>
          <a
            href={siteConfig.artSite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm link-hover focus-ring rounded"
            style={{ color: 'var(--color-grey-400)' }}
          >
            Art
          </a>
        </div>

        {/* Main nav */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <span className="text-sm" style={{ color: 'var(--color-grey-400)' }}>
            &copy; {new Date().getFullYear()} Oliver Newth
          </span>

          <nav className="flex flex-wrap items-center gap-6 md:gap-8" aria-label="Footer navigation">
            <a
              href="#contact"
              className="text-sm link-hover focus-ring rounded"
              style={{ color: 'var(--color-grey-400)' }}
            >
              Contact
            </a>
            <a
              href={siteConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm link-hover focus-ring rounded"
              style={{ color: 'var(--color-grey-400)' }}
            >
              GitHub
            </a>
            <a
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm link-hover focus-ring rounded"
              style={{ color: 'var(--color-grey-400)' }}
            >
              LinkedIn
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
