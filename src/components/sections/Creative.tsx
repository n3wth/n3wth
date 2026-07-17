import { useState } from 'react'
import { Lightbox, type LightboxMedia } from '@astryxdesign/core/Lightbox'
import { SectionHeader } from '../Frame'
import { installations } from '../../data/content'

/** "burning-man" -> "Burning man" (sentence case, hyphens to spaces). */
function sentenceCase(type: string) {
  const label = type.replace(/-/g, ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const media: LightboxMedia[] = installations.map((inst) => ({
  src: inst.image,
  alt: inst.imageAlt,
}))

/* After dark: the art gets the same treatment as the hero — full-viewport
   bands with a quiet caption rail beneath each, not thumbnails in a grid.
   This is the visual counterweight to the dense ship log above. Clicking a
   band opens the gallery in an Astryx Lightbox. */
export function Creative() {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  return (
    <section id="creative" aria-label="After dark">
      <SectionHeader
        title="I build things that glow"
        lede="Large-scale light for the desert and the city — Burning Man sculpture and San Francisco memorials. I spoke at Robot Heart about where art and technology meet."
      />

      <div className="pb-6 md:pb-10">
        {installations.map((inst, i) => (
          <figure key={inst.id} data-reveal className="mb-14 md:mb-20 last:mb-0">
            <button
              type="button"
              className="bleed block overflow-hidden cursor-zoom-in p-0 border-0 bg-transparent"
              onClick={() => {
                setLightboxIndex(i)
                setLightboxOpen(true)
              }}
              aria-label={`View ${inst.title} full screen`}
            >
              <img
                src={inst.image}
                alt={inst.imageAlt}
                loading="lazy"
                decoding="async"
                className="w-full object-cover"
                style={{
                  height:
                    i === 0
                      ? 'clamp(420px, 78vh, 820px)'
                      : 'clamp(360px, 62vh, 680px)',
                }}
              />
            </button>
            <figcaption className="section-pad !py-5 md:!py-6 flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <h3
                className="display text-xl md:text-2xl"
                style={{ letterSpacing: '-0.02em' }}
              >
                {inst.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--ink-dim)' }}
              >
                {inst.tagline}
              </p>
              <p className="meta ml-auto whitespace-nowrap">
                <span style={{ color: 'var(--ink)' }}>{inst.year}</span>
                <span className="mx-2" style={{ color: 'var(--ink-faint)' }}>
                  ·
                </span>
                {inst.location}
                <span className="mx-2" style={{ color: 'var(--ink-faint)' }}>
                  ·
                </span>
                {sentenceCase(inst.type)}
              </p>
            </figcaption>
          </figure>
        ))}
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
