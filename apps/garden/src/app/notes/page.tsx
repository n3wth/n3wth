import type { Metadata } from 'next'
import { getAllNotes, getPublishedNoteCount } from '@/lib/content'
import { getGraphData } from '@/lib/graph'
import { NotesIndexClient, type NoteListItem } from '@/components/NotesIndexClient'
import { PageHeader } from '@/components/PageHeader'
import { SiteContainer, SiteSection } from '@n3wth/ui/site'

import { site } from '@/lib/site'

const BASE_URL = site.url

export const metadata: Metadata = {
  title: 'Field guide',
  description: 'Every plant in the garden — browse, search, and sort the notes',
  alternates: { canonical: '/notes' },
  openGraph: {
    title: 'Field guide',
    description: 'Every plant in the garden — browse, search, and sort the notes',
    type: 'website',
    url: '/notes',
    siteName: 'n3wth/garden',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Field guide',
    description: 'Every plant in the garden — browse, search, and sort the notes',
  },
}

export default function NotesPage() {
  const graph = new Map(getGraphData().nodes.map((n) => [n.id, n]))

  const notes: NoteListItem[] = getAllNotes()
    .filter((n) => n.slug !== '' && n.slug !== 'notes')
    .map((n) => {
      const g = graph.get(n.slug)
      return {
        slug: n.slug,
        title: n.title,
        description: n.description || '',
        tags: n.tags,
        stage: n.stage,
        readingTime: n.readingTime,
        linkCount: g?.linkCount ?? 0,
        created: g?.created ?? 0,
        modified: g?.modified ?? 0,
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title))

  const noteCount = getPublishedNoteCount()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Field guide',
    description: `Every plant in the garden — ${noteCount} notes to browse, search, and sort`,
    url: `${BASE_URL}/notes`,
    isPartOf: { '@type': 'WebSite', name: 'n3wth/garden', url: BASE_URL },
    author: { '@type': 'Person', name: 'Oliver Newth', url: site.parentUrl },
  }

  return (
    <SiteContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="notes-hero">
        {/* The meadow is the field guide's specimen plate. Its black
            background dissolves into the page so only the linework remains. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/meadow.webp"
          alt=""
          aria-hidden
          width={900}
          height={672}
          className="notes-hero-meadow"
        />
        <PageHeader
          className="notes-hero-copy"
          title={<span className="notes-hero-title">Every plant in the garden</span>}
          sub={<span className="notes-hero-description">Each note drawn as it grows in the world — its height is its maturity, its branches are its connections.</span>}
        />
      </div>
      <SiteSection><NotesIndexClient notes={notes} /></SiteSection>
    </SiteContainer>
  )
}
