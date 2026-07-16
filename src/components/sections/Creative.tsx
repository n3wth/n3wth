import { SectionHeader } from '../Frame'
import { BeamsMark } from '../marks'
import { installations } from '../../data/content'

/** "burning-man" -> "Burning man" (sentence case, hyphens to spaces). */
function sentenceCase(type: string) {
  const label = type.replace(/-/g, ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/* After dark: the art gets the same treatment as the hero — full-viewport
   bands with a quiet caption rail beneath each, not thumbnails in a grid.
   This is the visual counterweight to the dense ship log above. */
export function Creative() {
  return (
    <section id="creative" aria-label="After dark">
      <SectionHeader
        index="03"
        eyebrow="After dark"
        title="I build things that glow"
        lede="Large-scale light for the desert and the city — Burning Man sculpture and San Francisco memorials. I spoke at Robot Heart about where art and technology meet."
        mark={<BeamsMark size={56} />}
      />

      <div className="pb-6 md:pb-10">
        {installations.map((inst, i) => (
          <figure key={inst.id} data-reveal className="mb-14 md:mb-20 last:mb-0">
            <div className="bleed overflow-hidden">
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
            </div>
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
    </section>
  )
}
