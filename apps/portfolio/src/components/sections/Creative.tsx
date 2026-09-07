import { Fragment } from 'react'
import {
  installations,
  type CreditLink,
  type Installation,
} from '../../data/content'

/** "burning-man" -> "Burning man" (sentence case, hyphens to spaces). */
function sentenceCase(type: string) {
  const label = type.replace(/-/g, ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const [opener, ...works] = installations

/* Institutions named in a credit line become inline links at the credit's
   own type size. Each link's text has to appear verbatim in the tagline; a
   miss leaves that phrase as plain text rather than dropping the credit. */
function taglineParts(inst: Installation) {
  let parts: (string | CreditLink)[] = [inst.tagline]

  for (const link of inst.creditLinks ?? []) {
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return [part]
      const at = part.indexOf(link.text)
      if (at === -1) return [part]
      return [part.slice(0, at), link, part.slice(at + link.text.length)]
    })
  }

  return parts.filter((part) => part !== '')
}

/* Title, provenance, and credits form one caption beside the same edge. */
const railClass = 'section-pad !py-5 md:!py-6'

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
        <p className="meta m-0 mb-3">
          <span style={{ color: 'var(--ink)' }}>{inst.year}</span>
          <span className="mx-2" style={{ color: 'var(--ink-faint)' }}>·</span>
          {inst.location}
          <span className="mx-2" style={{ color: 'var(--ink-faint)' }}>·</span>
          {sentenceCase(inst.type)}
        </p>
        <p
          className="text-sm leading-relaxed m-0"
          style={{ color: 'var(--ink-dim)', maxWidth: '72ch', textWrap: 'balance' }}
        >
          {taglineParts(inst).map((part, i) =>
            typeof part === 'string' ? (
              <Fragment key={i}>{part}</Fragment>
            ) : (
              <a
                key={i}
                href={part.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
              >
                {part.text}
              </a>
            )
          )}
        </p>
      </div>
    </>
  )
}

/* Identify each work before its photograph; tall frames give the artwork
   room while the opening photograph stays aligned to the installation. */
export function Creative() {
  return (
    <section aria-label="Art">
      <header data-reveal className="section-pad !pt-8 !pb-6 md:!pt-12 md:!pb-8">
        <h1 className="display page-title">
          Art
        </h1>
        <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--ink-dim)', maxWidth: '48ch', textWrap: 'balance' }}>
          Large-scale light for the desert and the city. Burning Man sculpture, San Francisco memorials.
        </p>
      </header>

      {/* Opening work */}
      <figure data-reveal className="m-0">
        <figcaption className={railClass}>
          <WorkCredit inst={opener} />
        </figcaption>
        <div
          className="relative overflow-hidden bleed"
          style={{ height: 'clamp(360px, 65svh, 800px)' }}
        >
          <img
            src={opener.image}
            alt={opener.imageAlt}
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover object-bottom"
          />
        </div>
      </figure>

      {/* The works */}
      <div className="pt-5 pb-4 md:pt-8 md:pb-8">
        {works.map((inst) => (
          <figure id={inst.id} key={inst.id} data-reveal className="mb-10 md:mb-16 last:mb-0 m-0 scroll-mt-20">
            <figcaption className={railClass}>
              <WorkCredit inst={inst} />
            </figcaption>
            <div
              className="relative overflow-hidden bleed"
              style={{ height: 'clamp(360px, 65svh, 800px)' }}
            >
              <img
                src={inst.image}
                alt={inst.imageAlt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </figure>
        ))}
      </div>

    </section>
  )
}
