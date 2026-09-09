import type { Metadata } from 'next'
import { getPublishedNoteCount } from '@/lib/content'
import { getGraphData } from '@/lib/graph'
import { WorldGardenClient } from '@/components/WorldGardenClient'
import { HomePageClient } from '@/components/HomePageClient'
import { FamilyStrip } from '@/components/FamilyStrip'
import { Button } from '@n3wth/ui/primitives'
import { ShimmerText } from '@/components/ShimmerText'
import { PageHeader, SiteContainer } from '@n3wth/ui/site'

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

        {/* Hero */}
        <SiteContainer data-world-exclude className="home-overlay">
          <PageHeader title={
            <ShimmerText>
              A garden of growing ideas
            </ShimmerText>
          } description={<>
              {noteCount} interconnected notes on careers, learning, health, and
              building things. Each light is a note — the taller it grows, the more
              evergreen the idea.
            </>} actions={<>
              <Button label="Browse all notes" variant="primary" href="/notes" />
              <Button label="Random note" variant="ghost" href="/random" />
            </>} />
        </SiteContainer>

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
