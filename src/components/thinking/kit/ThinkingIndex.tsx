import { RouterLink } from '../../RouterLink'
import type { RegisteredPiece } from '../registry'

/**
 * The map into every registered piece, sitting above the flat stack on
 * /thinking. Each piece collapses to a stop — date, title (a real link to
 * its own /thinking/:slug route), dek, and its "The test:" line if the
 * piece has one — grouped by what the piece actually is (a position vs.
 * a build log), not by registration order. The only piece that ever
 * renders in full is the one someone actually opens.
 *
 * Each stop carries a big display numeral in the left gutter — an
 * editorial index device (basement.studio, In Common With) rather than
 * a card or a thumbnail: it gives the list rhythm and scale variety
 * without introducing imagery this site doesn't have per piece, and it
 * stays flat (no shadow, no fill box). A plain straight rail (a CSS
 * border, not SVG) runs the length of the group for continuity — an
 * earlier version tried to stretch one organic MarginNote-style curve
 * the full height of the column via preserveAspectRatio="none", which
 * non-uniformly distorted its two bezier segments across an arbitrary,
 * much-taller-than-wide box and read as broken rather than flowing.
 */

const GROUP_LABEL: Record<'position' | 'system', string> = {
  position: 'Positions',
  system: 'Systems & build logs',
}

function IndexGroup({ group, pieces }: { group: 'position' | 'system'; pieces: RegisteredPiece[] }) {
  if (pieces.length === 0) return null
  return (
    <div data-reveal className="relative border-l pl-16 md:pl-20" style={{ borderColor: 'var(--rail)' }}>
      <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-label)' }}>
        {GROUP_LABEL[group]}
      </p>
      <ul className="mt-6 space-y-10">
        {pieces.map(({ meta }, i) => (
          <li key={meta.id} className="relative">
            <span
              aria-hidden="true"
              className="font-display absolute -left-16 top-0 text-[2.5rem] leading-none md:-left-20 md:text-[3rem]"
              style={{ color: 'var(--rail-strong)', fontWeight: 600 }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="font-mono text-xs" style={{ color: 'var(--ink-faint)' }}>
              {new Date(meta.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <RouterLink
              href={`/thinking/${meta.id}`}
              className="link-underline display mt-2 inline-block text-[clamp(1.15rem,1.9vw,1.5rem)] max-w-[24ch]"
              style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}
            >
              {meta.title}
            </RouterLink>
            <p className="mt-2 max-w-[46ch] text-sm leading-relaxed md:text-base" style={{ color: 'var(--ink-dim)' }}>
              {meta.dek}
            </p>
            {meta.test && (
              <p className="mt-3 max-w-[46ch] text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
                <span className="font-mono text-xs uppercase tracking-wide" style={{ color: 'var(--ink-faint)' }}>
                  The test:
                </span>{' '}
                {meta.test}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ThinkingIndex({ pieces }: { pieces: RegisteredPiece[] }) {
  const positions = pieces.filter((p) => p.meta.group === 'position')
  const systems = pieces.filter((p) => p.meta.group === 'system')
  return (
    <nav aria-label="Thinking index" className="section-pad pad-tight !pt-0">
      <div className="grid gap-14 md:grid-cols-2 md:gap-16">
        <IndexGroup group="position" pieces={positions} />
        <IndexGroup group="system" pieces={systems} />
      </div>
    </nav>
  )
}
