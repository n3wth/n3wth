import { withTheme } from '../components/withTheme'
import { Suspense } from 'react'
import { registeredPieces } from '../components/thinking/registry'
import NotFound from './NotFound'
import { PageHeader, SiteSection } from '@n3wth/ui/site'
import '../notes.css'

/* The full render of a single registered piece — everything the index on
   /thinking collapses to one stop now lives here, on its own route, so
   there's nothing beside it on the page to divide from with a rule. */
function ThinkingPiece({ slug }: { slug: string }) {
  const piece = registeredPieces.find((p) => p.meta.id === slug)

  if (!piece) return <NotFound />

  const { meta, Body } = piece

  return (
    <section aria-label={meta.title} className="thinking-reading-page">
      <div className="site-content-gutter">
        <PageHeader title={meta.title} description={meta.dek} actions={
          <p className="text-sm" style={{ color: 'var(--ink-dim)' }}>
            <time dateTime={meta.date}>{new Date(meta.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</time>
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

export default withTheme(ThinkingPiece)
