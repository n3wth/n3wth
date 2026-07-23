import { Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { registeredPieces } from '../components/thinking/registry'
import { usePageMeta } from '../hooks/usePageMeta'
import NotFound from './NotFound'

/* The full render of a single registered piece — everything the index on
   /thinking collapses to one stop now lives here, on its own route, so
   there's nothing beside it on the page to divide from with a rule.
   Reached via the index's RouterLink (viewTransition), so index -> piece
   is a real expansion, not a hard swap. */
export default function ThinkingPiece() {
  const { slug } = useParams()
  const piece = registeredPieces.find((p) => p.meta.id === slug)

  // Matches NotFound's own usePageMeta call exactly when there's no piece,
  // so effect ordering (child-before-parent) can't leave a mismatched title.
  usePageMeta(
    piece ? `${piece.meta.title} — Oliver Newth` : 'Not found — Oliver Newth',
    piece ? piece.meta.dek : 'This page does not exist.'
  )

  if (!piece) return <NotFound />

  const { meta, Body } = piece

  return (
    <section aria-label={meta.title}>
      <div className="section-pad pad-tight">
        {/* Date sits on its own line above the title/dek row instead of
            stacked inside the title's column — the row below starts flush
            at the top on both sides, so the dek's first line lands level
            with the title's first line instead of with the date. */}
        <div className="mb-10" data-reveal>
          <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-faint)' }}>
            {new Date(meta.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <div className="mt-3 md:grid md:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] md:gap-16 md:items-start">
            <h1
              className="display text-[clamp(2rem,4vw,3rem)] max-w-[20ch]"
              style={{ letterSpacing: '-0.03em', lineHeight: 1.04, fontWeight: 600 }}
            >
              {meta.title}
            </h1>
            <p className="mt-6 md:mt-0 text-base md:text-lg leading-relaxed" style={{ color: 'var(--ink)' }}>
              {meta.dek}
            </p>
          </div>
        </div>

        <Suspense fallback={<div className="h-40" aria-hidden />}>
          <Body />
        </Suspense>
      </div>
    </section>
  )
}
