import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { gsap, SplitText, useGSAP } from '../../lib/gsap'
import { siteConfig } from '../../data/content'
import { ArrowMark } from '../marks'

export function Contact() {
  const ref = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const splitRef = useRef<SplitText | null>(null)

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced || !titleRef.current) return

      splitRef.current = new SplitText(titleRef.current, {
        type: 'chars',
        charsClass: 'contact-char',
      })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top 70%' },
        defaults: { ease: 'power3.out' },
      })
      tl.from('[data-contact-eyebrow]', { opacity: 0, y: 16, duration: 0.5 })
        .from(
          splitRef.current.chars,
          { yPercent: 110, opacity: 0, duration: 0.8, stagger: { amount: 0.4 } },
          '-=0.2'
        )
        .from('[data-contact-fade]', { opacity: 0, y: 20, duration: 0.6, stagger: 0.12 }, '-=0.3')

      return () => {
        splitRef.current?.revert()
        splitRef.current = null
      }
    },
    { scope: ref }
  )

  return (
    <section
      ref={ref}
      id="contact"
      aria-label="Contact"
      className="relative min-h-[85vh] flex items-center"
    >
      <span className="tick tick-tl" aria-hidden="true" style={{ top: 0, left: -5 }} />
      <div className="section-pad pad-air w-full">
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p data-contact-eyebrow className="eyebrow mb-6">
              Get in touch
            </p>
            <h2
              ref={titleRef}
              className="display text-[clamp(3rem,12vw,9rem)]"
              style={{ overflow: 'hidden' }}
            >
              Let's talk
            </h2>

            <p
              data-contact-fade
              className="mt-8 text-base md:text-xl leading-relaxed max-w-lg"
              style={{ color: 'var(--ink-dim)' }}
            >
              Happy to talk about AI safety, LED art, or grab coffee in San
              Francisco.
            </p>

            <a
              data-contact-fade
              href={`mailto:${siteConfig.email}`}
              className="btn btn-solid mt-10 group"
            >
              {siteConfig.email}
              <ArrowUpRight
                size={16}
                strokeWidth={1.5}
                className="btn-arrow transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>

            <ul data-contact-fade className="flex flex-wrap gap-x-8 gap-y-3 mt-12">
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

          <div
            data-contact-fade
            className="hidden md:block shrink-0"
            style={{ color: 'var(--ink-faint)' }}
          >
            <ArrowMark size={64} />
          </div>
        </div>
      </div>
    </section>
  )
}
