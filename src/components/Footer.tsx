import { siteConfig } from '../data/content'

export function Footer() {
  return (
    <footer className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <span className="font-display text-sm font-medium text-white">
              {siteConfig.name}
            </span>
            <span className="text-sm" style={{ color: 'var(--color-grey-400)' }}>
              &copy; {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex items-center gap-8">
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
          </div>
        </div>
      </div>
    </footer>
  )
}
