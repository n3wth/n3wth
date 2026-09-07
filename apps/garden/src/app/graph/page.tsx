import type { Metadata } from 'next'
import { getGraphData } from '@/lib/graph'
import { getPublishedNoteCount } from '@/lib/content'
import { NoteGraph } from '@/components/NoteGraph'

import { site } from '@/lib/site'

const BASE_URL = site.url

export const metadata: Metadata = {
  title: 'Graph',
  description: 'Explore the garden as an interactive graph of connected notes',
  alternates: { canonical: '/graph' },
  openGraph: {
    title: 'Garden graph',
    description: 'Explore the garden as an interactive graph of connected notes',
    type: 'website',
    url: '/graph',
    siteName: 'n3wth/garden',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garden graph',
    description: 'Explore the garden as an interactive graph of connected notes',
  },
}

export default function GraphPage() {
  const graphData = getGraphData()
  const noteCount = getPublishedNoteCount()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Garden graph',
    description: `Interactive graph visualization of ${noteCount} notes connected by ${graphData.edges.length} links`,
    url: `${BASE_URL}/graph`,
    isPartOf: { '@type': 'WebSite', name: 'n3wth/garden', url: BASE_URL },
    author: { '@type': 'Person', name: 'Oliver Newth', url: site.parentUrl },
  }

  return (
    // z-40, one below the shared nav-island (z-50) — the graph used to
    // cover the real nav with its own wordmark + back link; now the nav
    // renders on top and owns wayfinding, same as every other route.
    <div className="fixed inset-0 z-40" style={{ background: 'var(--color-background-body)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NoteGraph
        nodes={graphData.nodes}
        edges={graphData.edges}
        fullscreen
        className="w-full h-full"
      />

      {/* Two corner panels of matching weight — stats+controls on the left,
          the legend on the right — so the canvas reads as framed rather
          than lopsided. Both sit below the nav-island (top-20, matching
          the site's pt-20 content offset) instead of under it. */}
      {/* min-height matches the legend panel's rendered height so the two
          corner cards read as a matched pair instead of an uneven stack —
          their content lengths differ, but their footprint shouldn't. */}
      <div className="glass-panel absolute top-20 left-6 z-10 px-4 py-3 sm:min-h-[7.6rem]">
        {/* Visually hidden — the nav-island already shows the wordmark and
            Graph's active state, so a visible "Garden graph" repeated the
            same information. Kept for screen readers / page structure. */}
        <h1 className="sr-only">Garden graph</h1>
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          {getPublishedNoteCount()} notes &middot; {graphData.edges.length} connections
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-2 max-w-48 pointer-fine-only">
          Scroll to zoom. Drag to pan. Click a node to visit.
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-2 max-w-48 pointer-coarse-only">
          Pinch to zoom. Drag to pan. Tap a node to visit.
        </p>
      </div>

      {/* Legend: full-width row anchored to the bottom below sm, since it
          collides with the h1 in the top-20/top-20 corner layout at narrow
          widths; reverts to the top-right column at sm and up. */}
      <div
        className="glass-panel absolute inset-x-4 bottom-6 sm:inset-x-auto sm:right-6 sm:top-20 sm:bottom-auto z-10 flex flex-row flex-wrap sm:flex-col items-center sm:items-stretch justify-center sm:justify-start gap-x-4 gap-y-1.5 sm:gap-1.5 px-3 py-2"
        style={{ pointerEvents: 'none' }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--color-text-disabled)' }} />
          <span className="text-xs text-[var(--color-text-secondary)]">Seedling</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--color-text-secondary)' }} />
          <span className="text-xs text-[var(--color-text-secondary)]">Budding</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--color-text-primary)' }} />
          <span className="text-xs text-[var(--color-text-secondary)]">Evergreen</span>
        </div>
        {/* The stronger visual channel — node size — was decoded nowhere */}
        <div className="flex items-center gap-2 pl-3 border-l border-[var(--color-border)] sm:pl-0 sm:border-l-0 sm:mt-1 sm:pt-1.5 sm:border-t">
          <span className="inline-flex items-end gap-0.5" aria-hidden>
            <span className="inline-block w-1 h-1 rounded-full" style={{ background: 'var(--color-text-secondary)' }} />
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--color-text-secondary)' }} />
          </span>
          <span className="text-xs text-[var(--color-text-secondary)]">Size = links</span>
        </div>
      </div>
    </div>
  )
}
