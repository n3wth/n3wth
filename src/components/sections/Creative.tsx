import { useState } from 'react'
import { Lightbox, type LightboxMedia } from '@astryxdesign/core/Lightbox'
import { Button } from '@astryxdesign/core/Button'
import { installations, siteConfig } from '../../data/content'

/** "burning-man" -> "Burning man" (sentence case, hyphens to spaces). */
function sentenceCase(type: string) {
  const label = type.replace(/-/g, ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const media: LightboxMedia[] = installations.map((inst) => ({
  src: inst.image,
  alt: inst.imageAlt,
}))

const [opener, ...works] = installations

/* After dark as a walk through a night gallery: a full-viewport opening
   work with the page title living on the image, a statement of intent,
   then each remaining installation at near-viewport height with its
   caption overlaid on the frame. Every image drifts slowly (CSS Ken
   Burns, reduced-motion safe) and opens a Lightbox at full resolution. */
export function Creative() {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const open = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <section aria-label="After dark">
      {/* Opening work: the page begins inside the art */}
      <div className="-mt-20">
        <button
          type="button"
          className="art-band bleed block w-full cursor-zoom-in p-0 border-0 bg-transparent text-left"
          style={{ height: '100svh' }}
          onClick={() => open(0)}
          aria-label={`View ${opener.title} full screen`}
        >
          <img
            src={opener.image}
            alt={opener.imageAlt}
            loading="eager"
            decoding="async"
            className="art-band-img"
          />
          <span className="art-band-scrim" aria-hidden="true" />
          <span className="art-band-caption">
            <span className="label block mb-5">After dark</span>
            <h2
              className="display text-[clamp(2.5rem,7vw,5.5rem)] mb-4"
              style={{ letterSpacing: '-0.035em', lineHeight: 0.95 }}
            >
              I build things that glow
            </h2>
            <span
              className="block max-w-md text-sm leading-relaxed"
              style={{ color: 'var(--ink-dim)' }}
            >
              Large-scale light for the desert and the city — Burning Man
              sculpture and San Francisco memorials.
            </span>
          </span>
        </button>
      </div>

      {/* Statement of intent */}
      <div data-reveal className="section-pad pad-air">
        <p
          className="display max-w-3xl text-[clamp(1.6rem,3.4vw,2.6rem)]"
          style={{ letterSpacing: '-0.025em', lineHeight: 1.15 }}
        >
          Software disappears into screens. Light stands thirty feet tall in
          the desert and asks seventy thousand people to look up.
        </p>
      </div>

      {/* The works */}
      <div className="pb-4 md:pb-8">
        {works.map((inst, i) => (
          <figure key={inst.id} data-reveal className="mb-6 md:mb-10 last:mb-0 m-0">
            <button
              type="button"
              className="art-band bleed block w-full cursor-zoom-in p-0 border-0 bg-transparent text-left"
              style={{ height: 'clamp(480px, 88svh, 900px)' }}
              onClick={() => open(i + 1)}
              aria-label={`View ${inst.title} full screen`}
            >
              <img
                src={inst.image}
                alt={inst.imageAlt}
                loading="lazy"
                decoding="async"
                className="art-band-img"
              />
              <span className="art-band-scrim" aria-hidden="true" />
              <span className="art-band-caption">
                <span
                  className="display block text-2xl md:text-3xl mb-2"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {inst.title}
                </span>
                <span
                  className="block max-w-md text-sm leading-relaxed mb-3"
                  style={{ color: 'var(--ink-dim)' }}
                >
                  {inst.tagline}
                </span>
                <span className="meta block">
                  <span style={{ color: 'var(--ink)' }}>{inst.year}</span>
                  <span className="mx-2" style={{ color: 'var(--ink-faint)' }}>
                    ·
                  </span>
                  {inst.location}
                  <span className="mx-2" style={{ color: 'var(--ink-faint)' }}>
                    ·
                  </span>
                  {sentenceCase(inst.type)}
                </span>
              </span>
            </button>
          </figure>
        ))}
      </div>

      {/* Closing */}
      <div data-reveal className="section-pad pad-air !pt-10 md:!pt-14">
        <p
          className="display max-w-2xl text-[clamp(1.4rem,2.8vw,2.1rem)] mb-8"
          style={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}
        >
          The next one is already sketched.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button
            label="More at newth.art"
            variant="primary"
            href={siteConfig.artSite}
            target="_blank"
            rel="noopener noreferrer"
          />
          <Button label="Build one with me" variant="ghost" href="/contact" />
        </div>
      </div>

      <Lightbox
        isOpen={lightboxOpen}
        onOpenChange={setLightboxOpen}
        media={media}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />
    </section>
  )
}
