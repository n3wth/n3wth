import { RouterLink } from '../RouterLink'
import { ecosystem } from '../../data/library'
import { registeredPieces } from '../thinking/registry'

/**
 * The closing strip: four properties, what each is for, and a real count
 * where one exists. n3wth.com's own number is derived from the piece
 * registry instead of stored in src/data/library.ts, so publishing a
 * twenty-second Thinking piece updates it without anyone remembering to.
 *
 * A rail above each column, nothing around them. Four bordered cards here
 * would undo everything the rest of the page argues for.
 */
export function EcosystemStrip() {
  return (
    <section
      aria-labelledby="ecosystem-title"
      className="section-pad !py-0 mt-16 mb-20 md:mt-24 md:mb-28"
    >
      <div className="border-t pt-8 md:pt-11" style={{ borderColor: 'var(--rail)' }}>
        <h2
          id="ecosystem-title"
          data-reveal
          className="display text-[clamp(1.35rem,2.3vw,1.95rem)]"
          style={{ letterSpacing: '-0.03em', lineHeight: 1.05 }}
        >
          Where everything lives
        </h2>

        <ul className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {ecosystem.map((property) => {
            const stat =
              property.id === 'n3wth-com' ? `${registeredPieces.length} pieces` : property.stat
            return (
              <li
                key={property.id}
                data-reveal
                className="border-t pt-5"
                style={{ borderColor: 'var(--rail-strong)' }}
              >
                <h3 className="display text-lg" style={{ letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                  <RouterLink href={property.href} className="link-underline">
                    {property.name}
                  </RouterLink>
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
                  {property.purpose}
                </p>
                {stat && <p className="mono mt-4">{stat}</p>}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
