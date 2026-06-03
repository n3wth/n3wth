import { siteConfig } from '../data/content'
import { CursorMark } from './marks'

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--rail)' }}>
      <div className="frame !border-b-0">
        <div className="relative section-pad !py-10 md:!py-14">
          <span className="tick tick-tl" aria-hidden="true" />
          <span className="tick tick-tr" aria-hidden="true" />
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <a href="#top" className="brand" aria-label="n3wth — back to top">
                <span className="brand-mark shrink-0" aria-hidden="true">
                  <CursorMark size={20} />
                </span>
                <span>n3wth</span>
              </a>
              <p className="meta mt-4 max-w-xs leading-relaxed">
                I build AI products at Google and large LED art on the side.
                Based in San Francisco.
              </p>
            </div>

            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              <li>
                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline meta font-normal tracking-[0.04em]"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline meta font-normal tracking-[0.04em]"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.artSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline meta font-normal tracking-[0.04em]"
                >
                  newth.art
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="link-underline meta font-normal tracking-[0.04em]"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>

          <p className="meta mt-10">
            © Oliver Newth 2026
          </p>
        </div>
      </div>
    </footer>
  )
}
