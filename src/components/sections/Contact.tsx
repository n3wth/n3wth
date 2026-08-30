import { ArrowUpRight } from 'lucide-react'
import { Button } from '@astryxdesign/core/Button'
import { ConvergeLight } from '../ConvergeLight'
import { siteConfig } from '../../data/content'

export function Contact() {
  return (
    <section id="contact" aria-label="Contact" className="min-h-[85vh] flex flex-col justify-center">
      {/* The bookend to /thinking's fork: two lines of light — one cool,
          one warm — converge and carry on as one. A conversation. */}
      <div className="bleed" aria-hidden>
        <div data-reveal className="w-full" style={{ height: 'clamp(200px, 34svh, 380px)' }}>
          <ConvergeLight />
        </div>
      </div>

      <div className="frame w-full">
        <div className="section-pad w-full">
          <div className="max-w-3xl">
            <h1 className="display text-[length:var(--display-h1)]">Let's talk</h1>

            <p className="mt-6 text-base md:text-xl leading-relaxed max-w-lg" style={{ color: 'var(--ink-dim)' }}>
              AI safety, LED art, or coffee in San Francisco.
            </p>

            {/* One action. The footer below already carries the rest. */}
            <div className="mt-10">
              <Button
                label={siteConfig.email}
                variant="primary"
                href={`mailto:${siteConfig.email}`}
                endContent={<ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
