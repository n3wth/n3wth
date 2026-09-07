import type { Metadata } from 'next'
import { getPublishedNoteCount } from '@/lib/content'
import { getGraphData } from '@/lib/graph'
import { WorldGardenClient } from '@/components/WorldGardenClient'
import { HomePageClient } from '@/components/HomePageClient'
import { FamilyStrip } from '@/components/FamilyStrip'
import { Button } from '@astryxdesign/core/Button'
import { ShimmerText } from '@/components/ShimmerText'

import { site } from '@/lib/site'

const BASE_URL = site.url

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const noteCount = getPublishedNoteCount()
  const graphData = getGraphData()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'n3wth/garden',
    description: `A digital garden of ${noteCount} interconnected notes on careers, learning, health, and building things`,
    url: BASE_URL,
    isPartOf: { '@type': 'WebSite', name: 'n3wth/garden', url: BASE_URL },
    author: { '@type': 'Person', name: 'Oliver Newth', url: site.parentUrl },
  }

  return (
    <HomePageClient>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="home-immersive relative w-full">
        <style>{`footer { display: none }`}</style>

        {/* Hero */}
        <div data-world-exclude className="home-overlay home-introduction">
          <h1 className="font-display text-[2rem] md:text-[2.75rem] leading-[1.05] font-semibold tracking-[-0.035em] text-[var(--color-text-primary)] text-balance">
            <ShimmerText sweepOnMount sweepDelay={1.6}>
              A garden of growing ideas
            </ShimmerText>
          </h1>
            <p className="home-description text-sm text-[var(--color-text-secondary)] leading-6 max-w-[52ch]">
              {noteCount} interconnected notes on careers, learning, health, and
              building things. Each light is a note — the taller it grows, the more
              evergreen the idea.
            </p>
            <div className="home-actions flex flex-wrap items-center gap-3">
              <Button label="Browse all notes" variant="primary" href="/notes" />
              <Button label="Random note" variant="ghost" href="/random" />
            </div>
        </div>

        <div className="home-garden-stage relative">
          {graphData.nodes.length > 0 && (
            <WorldGardenClient nodes={graphData.nodes} edges={graphData.edges} />
          )}
        </div>

        <div className="home-garden-caption">
          {/* Interaction hint */}
          <p data-world-exclude className="text-xs text-[var(--color-text-secondary)]">
            <span className="md:hidden">Tap a light to see its note</span>
            <span className="max-md:hidden">Move to look around &middot; Click a light to see its note</span>
          </p>

          {/* Garden stats: only the figure the hero doesn't already give */}
          <div data-world-exclude>
            <p className="text-xs text-[var(--color-text-disabled)]">
              {graphData.edges.length} links between notes
            </p>
          </div>
        </div>

        {/* n3wth ecosystem links */}
        <FamilyStrip />
      </div>
    </HomePageClient>
  )
}
