import { siteConfig } from '../data/content'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer style={{ borderTop: '1px solid var(--rail)' }}>
      <div className="frame !border-b-0">
        <div className="relative section-pad !py-10 md:!py-14">
          <span className="tick tick-tl" aria-hidden="true" />
          <span className="tick tick-tr" aria-hidden="true" />
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <a
                href="#top"
                className="font-mono text-sm font-medium tracking-[0.04em]"
                style={{ color: 'var(--ink)' }}
              >
                n3wth<span style={{ color: 'var(--signal)' }}>.</span>
              </a>
              <p className="meta mt-4 max-w-xs leading-relaxed">
                AI product leader. Building toward a world where agents work
                alongside humans, not just for them.
              </p>
            </div>

            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              <li>
                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline font-mono text-xs uppercase tracking-[0.14em]"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline font-mono text-xs uppercase tracking-[0.14em]"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.artSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline font-mono text-xs uppercase tracking-[0.14em]"
                >
                  newth.art
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="link-underline font-mono text-xs uppercase tracking-[0.14em]"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>

          <p className="meta mt-10">
            © {year} Oliver Newth — n3wth.com
          </p>
        </div>
      </div>
    </footer>
  )
}
