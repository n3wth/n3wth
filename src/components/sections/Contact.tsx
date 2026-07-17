import { ArrowUpRight } from 'lucide-react'
import { Button } from '@astryxdesign/core/Button'
import { siteConfig } from '../../data/content'
import { ShimmerText } from '../ShimmerText'

export function Contact() {
  return (
    <section
      id="contact"
      aria-label="Contact"
      className="relative min-h-[85vh] flex items-center"
    >
      <span className="tick tick-tl" aria-hidden="true" style={{ top: 0, left: -5 }} />
      <div className="section-pad pad-air w-full relative">
        <span className="ghost-index ghost-index--lit" aria-hidden="true">
          06
        </span>
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-3xl relative">
            <p className="eyebrow mb-6">
              <span className="index">06</span>
              <span className="mx-3" style={{ color: 'var(--ink-faint)' }} aria-hidden="true">
                ·
              </span>
              Get in touch
            </p>
            <h2 className="display text-[clamp(3rem,12vw,9rem)]">
              <ShimmerText>Let's talk</ShimmerText>
            </h2>

            <p
              className="mt-8 text-base md:text-xl leading-relaxed max-w-lg"
              style={{ color: 'var(--ink-dim)' }}
            >
              Happy to talk about AI safety, LED art, or grab coffee in San
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
              <li>
                <a
                  href={siteConfig.artSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-xs font-medium uppercase tracking-[0.16em]"
                >
                  newth.art
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  )
}
