import { ArrowUpRight } from 'lucide-react'
import { Button } from '@astryxdesign/core/Button'
import { siteConfig } from '../../data/content'

export function Contact() {
  return (
    <section
      id="contact"
      aria-label="Contact"
      className="bleed relative min-h-[85vh] flex items-center overflow-hidden"
    >
      {/* Night playa backdrop — the quiet counterpart to the hero. The
          left side of the image is near-black, so the copy sits on it
          without a heavy scrim; a soft edge fade blends into the page. */}
      <div aria-hidden className="absolute inset-0">
        <img
          src="/images/hero-playa.webp"
          srcSet="/images/hero-playa-sm.webp 1080w, /images/hero-playa.webp 2400w"
          sizes="100vw"
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(8,9,11,0.82), rgba(8,9,11,0.25) 55%, rgba(8,9,11,0.05)), linear-gradient(to bottom, var(--bg), transparent 18%, transparent 82%, var(--bg))',
          }}
        />
      </div>

      <div className="frame relative w-full">
      <div className="section-pad pad-air w-full relative">
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-3xl relative">
            <h1 className="display text-[clamp(3rem,12vw,9rem)]">
              Let's talk
            </h1>

            <p
              className="mt-8 text-base md:text-xl leading-relaxed max-w-lg"
              style={{ color: 'var(--ink-dim)' }}
            >
              Happy to talk about AI safety or LED art, or grab coffee in San
              Francisco.
            </p>

            {/* Just the one action — the footer directly below already
                lists GitHub/LinkedIn/Email, and this page repeating them
                showed every element twice on one screen. */}
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
          </div>

        </div>
      </div>
      </div>
    </section>
  )
}
