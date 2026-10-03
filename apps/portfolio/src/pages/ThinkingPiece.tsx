import { Suspense, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { registeredPieces } from '../components/thinking/registry'
import { usePageMeta, buildWebPageSchema, buildArticleSchema } from '../hooks/usePageMeta'
import NotFound from './NotFound'
import { PageHeader, SiteSection } from '@n3wth/ui/site'
import '../notes.css'

const SITE_URL = 'https://n3wth.com'

/* The full render of a single registered piece — everything the index on
   /thinking collapses to one stop now lives here, on its own route, so
   there's nothing beside it on the page to divide from with a rule. */
export default function ThinkingPiece() {
  const params = useParams()
  const slug = params.slug ?? params['*']
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
    noindex: !piece,
    publishedTime: piece?.meta.date,
    ogImage: piece ? `/og/thinking/${piece.meta.id}.png` : '/og/thinking.png',
    jsonLd,
  })

  if (!piece) return <NotFound />

  const { meta, Body } = piece

  return (
    <section aria-label={meta.title} className="thinking-reading-page">
      <div className="site-content-gutter">
        <PageHeader title={meta.title} description={meta.dek} actions={
          <p className="text-sm" style={{ color: 'var(--ink-dim)' }}>
            {/* Parse as local time: bare YYYY-MM-DD parses as UTC midnight
                and renders a day early in every US timezone. */}
            <time dateTime={meta.date}>{new Date(`${meta.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
          </p>
        } />

        {/* Tall fallback keeps the footer out of the initially tappable
            region while the piece chunk loads — a 160px placeholder put
            footer links exactly where the article lands when it resolves. */}
        <SiteSection><Suspense fallback={<div className="min-h-[70vh]" aria-hidden />}>
          <Body />
        </Suspense></SiteSection>
      </div>
    </section>
  )
}
