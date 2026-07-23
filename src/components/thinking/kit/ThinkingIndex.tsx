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
 * The curve behind each group's list reuses MarginNote's stem-and-leaf
 * bezier idiom, stretched to whatever height the list ends up rendering
 * at via absolute inset-y-0 (the parent's height comes from its normal
 * flow content, so the child fills it exactly). It's static — no rAF —
 * because this is the map, not the hero; ForkLight already owns the
 * page's motion budget.
 */

const GROUP_LABEL: Record<'position' | 'system', string> = {
  position: 'Positions',
  system: 'Systems & build logs',
}

function IndexSpine() {
  return (
    <svg
      viewBox="0 0 24 100"
      preserveAspectRatio="none"
      className="kit-line-draw absolute inset-y-0 left-0 h-full w-6"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M 12 0 C 4 16, 20 30, 9 46 C 1 60, 21 74, 12 100"
        pathLength={1}
        fill="none"
        stroke="var(--rail-strong)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function IndexGroup({ group, pieces }: { group: 'position' | 'system'; pieces: RegisteredPiece[] }) {
  if (pieces.length === 0) return null
  return (
    <div data-reveal className="relative pl-9 md:pl-10">
      <IndexSpine />
      <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-label)' }}>
        {GROUP_LABEL[group]}
      </p>
      <ul className="mt-6 space-y-9">
        {pieces.map(({ meta }) => (
          <li key={meta.id}>
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
              <p className="mt-3 max-w-[46ch] text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
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
