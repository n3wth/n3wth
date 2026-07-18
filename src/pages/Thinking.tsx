import { Thinking as Positions } from '../components/sections/Thinking'
import { ForkLight } from '../components/ForkLight'
import { usePageMeta } from '../hooks/usePageMeta'
import gardenNotes from '../data/garden-notes.json'

interface GardenNote {
  title: string
  href: string
  description: string
  date: string
}

/* Real thinking, in progress: the most recently tended notes from the
   garden, snapshotted at build time (scripts/fetch-garden-notes.mjs).
   Nothing invented — if the feed is down, the last committed snapshot
   ships. */
function TendedRecently() {
  const notes = (gardenNotes as GardenNote[]).slice(0, 4)
  if (notes.length === 0) return null
  return (
    <section aria-label="Recently tended garden notes" className="frame">
      <div className="section-pad">
        <p className="text-xs tracking-wide" style={{ color: 'var(--ink-label)' }}>
          Tended recently
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
          Positions come from somewhere. These are the working notes — live from{' '}
          <a href="https://garden.n3wth.com" className="link-underline" style={{ color: 'var(--ink)' }}>
            the garden
          </a>
          , still growing.
        </p>
        <ul className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {notes.map((n) => (
            <li key={n.href} className="max-w-lg">
              <a href={n.href} className="link-underline text-base md:text-lg" style={{ color: 'var(--ink)' }}>
                {n.title}
              </a>
              {n.description && (
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
                  {n.description}
                </p>
              )}
              <p className="mt-2 font-mono text-xs" style={{ color: 'var(--ink-faint)' }}>
                {new Date(n.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function ThinkingPage() {
  usePageMeta(
    'Thinking — Oliver Newth',
    'Positions on production AI and agents as an org design problem, plus the working notes they grow from.'
  )

  return (
    <>
      <Positions />
      {/* A light path forking in the dark — the page's subject drawn once,
          between the positions and the working notes. Vector, so it stays
          sharp and draws itself in on reveal. */}
      {/* data-reveal lives on the inner div, not the bleed wrapper — the
          reveal's transform would override .bleed's translateX(-50%) */}
      <div className="bleed" aria-hidden>
        <div data-reveal className="w-full" style={{ height: 'clamp(220px, 42svh, 420px)' }}>
          <ForkLight />
        </div>
      </div>
      <TendedRecently />
    </>
  )
}
