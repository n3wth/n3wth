import { RouterLink } from '../../RouterLink'
import type { RegisteredPiece } from '../registry'

/**
 * The map into every registered piece, sitting above the flat stack on
 * /thinking. Each piece collapses to a stop — date, title (a real link to
 * its own /thinking/:slug route), and dek — grouped by what the piece
 * actually is (a position vs. a build log), not by registration order.
 * The only piece that ever renders in full is the one someone actually
 * opens.
 *
 * A plain straight rail (a CSS border, not SVG) runs the length of each
 * group for continuity — an earlier version tried to stretch one organic
 * MarginNote-style curve the full height of the column via
 * preserveAspectRatio="none", which non-uniformly distorted its two
 * bezier segments across an arbitrary, much-taller-than-wide box and
 * read as broken rather than flowing. A big display numeral per stop
 * was tried and cut — didn't earn its place. Dates are plain sans, not
 * mono — mono on metadata that isn't code or a timestamp log reads as a
 * borrowed technical costume rather than an actual constraint.
 */

const GROUP_LABEL: Record<'position' | 'system', string> = {
  position: 'Positions',
  system: 'Systems & build logs',
}

function IndexGroup({ group, pieces }: { group: 'position' | 'system'; pieces: RegisteredPiece[] }) {
  if (pieces.length === 0) return null
  return (
    <div data-reveal className="relative border-l pl-9 md:pl-10" style={{ borderColor: 'var(--rail)' }}>
      <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-label)' }}>
        {GROUP_LABEL[group]}
      </p>
      <ul className="mt-6 space-y-10">
        {pieces.map(({ meta }) => (
          <li key={meta.id} className="relative">
            <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-faint)' }}>
              {new Date(meta.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <RouterLink
              href={`/thinking/${meta.id}`}
              className="link-underline display mt-2 inline-block text-[clamp(1.3rem,2.2vw,1.75rem)] max-w-[26ch]"
              style={{ letterSpacing: '-0.02em', lineHeight: 1.12, fontWeight: 600 }}
            >
              {meta.title}
            </RouterLink>
            <p className="mt-2 max-w-[46ch] text-sm leading-relaxed md:text-base" style={{ color: 'var(--ink-dim)' }}>
              {meta.dek}
            </p>
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
