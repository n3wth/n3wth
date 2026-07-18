import { ArrowUpRight } from 'lucide-react'
import { Button } from '@astryxdesign/core/Button'
import { siteConfig } from '../../data/content'

export function Contact() {
  return (
    <section
      id="contact"
      aria-label="Contact"
      className="relative min-h-[85vh] flex items-center"
    >
      <div className="section-pad pad-air w-full relative">
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-3xl relative">
            <h2 className="display text-[clamp(3rem,12vw,9rem)]">
              Let's talk
            </h2>

            <p
              className="mt-8 text-base md:text-xl leading-relaxed max-w-lg"
              style={{ color: 'var(--ink-dim)' }}
            >
              Happy to talk about AI safety or LED art, or grab coffee in San
              Francisco.
            </p>

            <div className="mt-10">
              <Button
                label={siteConfig.email}
                variant="primary"
                href={`mailto:${siteConfig.email}`}
                endContent={
                  <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
                }
              />
            </div>

            <ul className="flex flex-wrap gap-x-8 gap-y-3 mt-12">
              <li>
                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-xs font-medium uppercase tracking-[0.16em]"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-xs font-medium uppercase tracking-[0.16em]"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  )
}
