import { installations, type Installation } from '../../data/content'

/** "burning-man" -> "Burning man" (sentence case, hyphens to spaces). */
function sentenceCase(type: string) {
  const label = type.replace(/-/g, ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const [opener, ...works] = installations

/* Balanced rail: title + credit left, provenance right — the stacked-left
   version left the rail's right half empty. Shared with the opening work,
   which otherwise showed its photograph with no title, collaborators, or
   year anywhere on the page. */
const railClass =
  'section-pad !py-5 md:!py-6 md:flex md:items-baseline md:justify-between md:gap-16'

function WorkCredit({ inst }: { inst: Installation }) {
  return (
    <>
      <div className="min-w-0">
        <h2
          className="display text-2xl md:text-3xl mb-2"
          style={{ letterSpacing: '-0.02em' }}
        >
          {inst.title}
        </h2>
        <p
          className="max-w-md text-sm leading-relaxed m-0"
          style={{ color: 'var(--ink-dim)' }}
        >
          {inst.tagline}
        </p>
      </div>
      <p className="meta m-0 mt-3 md:mt-0 shrink-0 md:text-right">
        <span style={{ color: 'var(--ink)' }}>{inst.year}</span>
        <span className="mx-2" style={{ color: 'var(--ink-faint)' }}>·</span>
        {inst.location}
        <span className="mx-2" style={{ color: 'var(--ink-faint)' }}>·</span>
        {sentenceCase(inst.type)}
      </p>
    </>
  )
}

/* After dark as a walk through a night gallery: a full-viewport opening
   work with the page title living on the image, a statement of intent,
   then each remaining installation at near-viewport height. Every work
   carries a credit rail under its frame. Every image drifts slowly (CSS
   Ken Burns, reduced-motion safe). */
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
            <h1
              className="display text-[length:var(--display-h1)] mb-4"
              style={{ letterSpacing: '-0.035em', lineHeight: 0.95, color: '#0b0c0e' }}
            >
              I build things that glow
            </h1>
            <p
              className="max-w-md text-sm leading-relaxed m-0"
              style={{ color: 'rgba(8, 9, 11, 0.72)' }}
            >
              Large-scale light for the desert and the city — Burning Man
              sculpture and San Francisco memorials.
            </p>
          </div>
        </div>
        <div className={railClass}>
          <WorkCredit inst={opener} />
        </div>
      </div>

      {/* Statement of intent */}
      <div data-reveal className="section-pad pad-air">
        <p
          className="display max-w-3xl text-[clamp(1.6rem,3.4vw,2.6rem)]"
          style={{ letterSpacing: '-0.025em', lineHeight: 1.15 }}
        >
          Software disappears into screens. Light stands thirty feet tall in
          the desert and asks strangers to look up.
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
            <figcaption className={railClass}>
              <WorkCredit inst={inst} />
            </figcaption>
          </figure>
        ))}
      </div>

    </section>
  )
}
