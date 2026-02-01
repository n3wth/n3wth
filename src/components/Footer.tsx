import { siteConfig } from '../data/content'

export function Footer() {
  return (
    <footer className="py-12 md:py-16 px-6 md:px-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <span className="text-sm" style={{ color: 'var(--color-grey-400)' }}>
          &copy; {new Date().getFullYear()}
        </span>

        <nav className="flex items-center gap-8" aria-label="Footer navigation">
          <a
            href="#contact"
            className="text-sm link-hover focus-ring rounded"
            style={{ color: 'var(--color-grey-400)' }}
          >
            Contact
          </a>
          <a
            href="/privacy"
            className="text-sm link-hover focus-ring rounded"
            style={{ color: 'var(--color-grey-400)' }}
          >
            Privacy
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
    </footer>
  )
}
