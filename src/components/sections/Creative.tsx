import { Button } from '@astryxdesign/core/Button'
import { installations } from '../../data/content'

/** "burning-man" -> "Burning man" (sentence case, hyphens to spaces). */
function sentenceCase(type: string) {
  const label = type.replace(/-/g, ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const [opener, ...works] = installations

/* After dark as a walk through a night gallery: a full-viewport opening
   work with the page title living on the image, a statement of intent,
   then each remaining installation at near-viewport height with its
   caption overlaid on the frame. Every image drifts slowly (CSS Ken
   Burns, reduced-motion safe). */
export function Creative() {
  return (
    <section aria-label="After dark">
      {/* Opening work: the page begins inside the art */}
      <div className="-mt-20">
        <div className="art-band bleed" style={{ height: '100svh' }}>
          <img
            src={opener.image}
            alt={opener.imageAlt}
            loading="eager"
            decoding="async"
            className="art-band-img"
          />
          <div className="art-band-caption art-band-caption--sky">
            <span className="label block mb-5" style={{ color: 'rgba(8, 9, 11, 0.62)' }}>
              After dark
            </span>
            <h2
              className="display text-[clamp(2.5rem,7vw,5.5rem)] mb-4"
              style={{ letterSpacing: '-0.035em', lineHeight: 0.95, color: '#0b0c0e' }}
            >
              I build things that glow
            </h2>
            <p
              className="max-w-md text-sm leading-relaxed m-0"
              style={{ color: 'rgba(8, 9, 11, 0.72)' }}
            >
              Large-scale light for the desert and the city — Burning Man
              sculpture and San Francisco memorials.
            </p>
          </div>
        </div>
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
        {works.map((inst) => (
          <figure key={inst.id} data-reveal className="mb-10 md:mb-16 last:mb-0 m-0">
            <div
              className="art-band bleed"
              style={{ height: 'clamp(480px, 88svh, 900px)' }}
            >
              <img
                src={inst.image}
                alt={inst.imageAlt}
                loading="lazy"
                decoding="async"
                className="art-band-img"
              />
            </div>
            <figcaption className="section-pad !py-5 md:!py-6">
              <h3
                className="display text-2xl md:text-3xl mb-2"
                style={{ letterSpacing: '-0.02em' }}
              >
                {inst.title}
              </h3>
              <p
                className="max-w-md text-sm leading-relaxed mb-2"
                style={{ color: 'var(--ink-dim)' }}
              >
                {inst.tagline}
              </p>
              <p className="meta m-0">
                <span style={{ color: 'var(--ink)' }}>{inst.year}</span>
                <span className="mx-2" style={{ color: 'var(--ink-faint)' }}>·</span>
                {inst.location}
                <span className="mx-2" style={{ color: 'var(--ink-faint)' }}>·</span>
                {sentenceCase(inst.type)}
              </p>
            </figcaption>
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
        <Button label="Build one with me" variant="primary" href="/contact" />
      </div>
    </section>
  )
}
