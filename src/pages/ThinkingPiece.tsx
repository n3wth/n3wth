import { Suspense, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { registeredPieces } from '../components/thinking/registry'
import { usePageMeta, buildWebPageSchema, buildArticleSchema } from '../hooks/usePageMeta'
import NotFound from './NotFound'

const SITE_URL = 'https://n3wth.com'

/* The full render of a single registered piece — everything the index on
   /thinking collapses to one stop now lives here, on its own route, so
   there's nothing beside it on the page to divide from with a rule.
   Reached via the index's RouterLink (viewTransition), so index -> piece
   is a real expansion, not a hard swap. */
export default function ThinkingPiece() {
  const { slug } = useParams()
  const piece = registeredPieces.find((p) => p.meta.id === slug)

  const title = piece ? `${piece.meta.title} — Oliver Newth` : 'Not found — Oliver Newth'
  const description = piece ? piece.meta.dek : 'This page does not exist.'
  const url = `${SITE_URL}/thinking/${slug}`

  // Build JSON-LD schemas for the piece
  const jsonLd = useMemo(() => {
    if (!piece) return undefined
    const schemas = buildWebPageSchema({
      url,
      title,
      description,
      datePublished: piece.meta.date,
      breadcrumbs: [
        { name: 'Home', url: `${SITE_URL}/` },
        { name: 'Thinking', url: `${SITE_URL}/thinking` },
        { name: piece.meta.title, url },
      ],
    })
    // Add Article schema for the piece
    schemas.push(buildArticleSchema({
      url,
      title: piece.meta.title,
      description: piece.meta.dek,
      datePublished: piece.meta.date,
      image: `${SITE_URL}/og/thinking/${piece.meta.id}.png`,
    }))
    return schemas
  }, [piece, title, description, url])

  usePageMeta(title, description, {
    ogImage: piece ? `/og/thinking/${piece.meta.id}.png` : '/og/thinking.png',
    jsonLd,
  })

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
          <p className="text-xs tracking-wide" style={{ color: 'var(--ink-dim)' }}>
            {/* Parse as local time: bare YYYY-MM-DD parses as UTC midnight
                and renders a day early in every US timezone. */}
            {new Date(`${meta.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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

        {/* Tall fallback keeps the footer out of the initially tappable
            region while the piece chunk loads — a 160px placeholder put
            footer links exactly where the article lands when it resolves. */}
        <Suspense fallback={<div className="min-h-[70vh]" aria-hidden />}>
          <Body />
        </Suspense>
      </div>
    </section>
  )
}
