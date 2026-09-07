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
      <div className="home-immersive relative w-full -mt-20 h-screen overflow-hidden">
        {/* The world is the whole page; hide the global footer */}
        <style>{`footer { display: none }`}</style>

        {/* 3D world: every note a light above the ground grid */}
        {graphData.nodes.length > 0 && (
          <WorldGardenClient nodes={graphData.nodes} edges={graphData.edges} />
        )}

        {/* Hero */}
        <div data-world-exclude className="home-overlay absolute left-6 md:left-10 top-24 md:top-28 max-w-md pr-6 z-10 pointer-events-none">
          <h1 className="font-display text-[2.4rem] md:text-[4rem] leading-[1.02] font-semibold tracking-[-0.035em] text-[var(--color-text-primary)] mb-5 text-balance pointer-events-auto">
            <ShimmerText sweepOnMount sweepDelay={1.6}>
              A garden of growing ideas
            </ShimmerText>
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] leading-7 mb-8 max-w-sm">
            {noteCount} interconnected notes on careers, learning, health, and
            building things. Each light is a note — the taller it grows, the more
            evergreen the idea.
          </p>
          <div className="flex flex-wrap items-center gap-3 pointer-events-auto">
            <Button label="Browse all notes" variant="primary" href="/notes" />
            <Button label="Random note" variant="ghost" href="/random" />
          </div>
        </div>

        {/* Interaction hint */}
        <p data-world-exclude className="absolute bottom-5 inset-x-6 z-10 text-center text-xs text-[var(--color-text-secondary)] pointer-events-none">
          <span className="md:hidden">Tap a light to see its note</span>
          <span className="max-md:hidden">Move to look around &middot; Click a light to see its note</span>
        </p>

        {/* Garden stats: only the figure the hero doesn't already give */}
        <div data-world-exclude className="home-overlay absolute bottom-6 left-6 md:left-10 z-10 max-md:hidden">
          <div className="glass-panel px-4 py-2.5">
            <p className="text-[11px] tracking-[0.08em] text-[var(--color-text-disabled)]">
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
