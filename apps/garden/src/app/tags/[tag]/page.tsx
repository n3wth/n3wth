import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ClickableCard } from '@astryxdesign/core/ClickableCard'
import { Breadcrumbs as AstryxBreadcrumbs, BreadcrumbItem } from '@astryxdesign/core/Breadcrumbs'
import { Text } from '@astryxdesign/core/Text'
import { getAllTags } from '@/lib/content'
import { GrowthStage } from '@/components/GrowthStage'
import { PageHeader, SiteContainer, SiteSection } from '@n3wth/ui/site'

import { site } from '@/lib/site'

const BASE_URL = site.url
const stageRank = { evergreen: 0, budding: 1, seedling: 2 } as const

interface PageProps {
  params: Promise<{ tag: string }>
}

export async function generateStaticParams() {
  const tags = getAllTags()
  return [...tags.keys()].map((tag) => ({
    tag: encodeURIComponent(tag),
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params
  const decoded = decodeURIComponent(tag)
  const tags = getAllTags()
  const notes = tags.get(decoded)
  const count = notes?.length ?? 0
  const description = `${count} ${count === 1 ? 'note' : 'notes'} in the ${decoded} grove`
  
  return {
    title: `${decoded} grove`,
    description,
    alternates: { canonical: `/tags/${encodeURIComponent(decoded)}` },
    openGraph: {
      title: `${decoded} grove`,
      description,
      type: 'website',
      url: `/tags/${encodeURIComponent(decoded)}`,
      siteName: 'n3wth/garden',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${decoded} grove`,
      description,
    },
  }
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params
  const decoded = decodeURIComponent(tag)
  const tags = getAllTags()
  const notes = tags.get(decoded)

  if (!notes) notFound()

  const sorted = [...notes].sort(
    (a, b) => stageRank[a.stage] - stageRank[b.stage] || a.title.localeCompare(b.title)
  )

  // Every other tag carried by a note in this grove — a reader who has
  // exhausted this list has somewhere else to walk besides back to /tags.
  const neighbourCounts = new Map<string, number>()
  for (const note of notes) {
    for (const t of note.tags) {
      if (t === decoded) continue
      neighbourCounts.set(t, (neighbourCounts.get(t) || 0) + 1)
    }
  }
  const rankedNeighbours = [...neighbourCounts.entries()].sort((a, b) => b[1] - a[1])
  const qualifying = rankedNeighbours.filter(([, count]) => count >= 2)
  const neighbours = (qualifying.length > 0 ? qualifying : rankedNeighbours).slice(0, 6)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${decoded} grove`,
    description: `${notes.length} ${notes.length === 1 ? 'note' : 'notes'} in the ${decoded} grove`,
    url: `${BASE_URL}/tags/${encodeURIComponent(decoded)}`,
    isPartOf: { '@type': 'WebSite', name: 'n3wth/garden', url: BASE_URL },
    author: { '@type': 'Person', name: 'Oliver Newth', url: site.parentUrl },
  }

  return (
    <SiteContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        <div className="mb-4">
          <AstryxBreadcrumbs variant="supporting">
            <BreadcrumbItem href="/">Garden</BreadcrumbItem>
            <BreadcrumbItem href="/tags">Groves</BreadcrumbItem>
            <BreadcrumbItem>{decoded}</BreadcrumbItem>
          </AstryxBreadcrumbs>
        </div>
        <PageHeader title={decoded} description={`${notes.length} ${notes.length === 1 ? 'note' : 'notes'} in this grove`} actions={
          <Link
            href={`/?grove=${encodeURIComponent(decoded)}`}
          >
            Stand in this grove in the garden →
          </Link>
        } />
        {neighbours.length > 0 && (
          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <span className="text-xs text-[var(--color-text-disabled)]">Neighbouring groves</span>
            {neighbours.map(([t]) => (
              <Link key={t} href={`/tags/${encodeURIComponent(t)}`} className="tag-pill">
                {t}
              </Link>
            ))}
          </div>
        )}
      </div>
      <SiteSection className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sorted.map((note) => (
          <ClickableCard key={note.slug} label={note.title} href={`/${note.slug}`}>
            <div className="flex flex-col min-h-[100px]">
              <Text type="body" weight="medium">{note.title}</Text>
              {note.description && (
                <Text type="supporting" color="secondary" display="block" maxLines={2}>
                  {note.description}
                </Text>
              )}
              <span className="mt-auto pt-2 flex flex-wrap items-center gap-3">
                <GrowthStage stage={note.stage} />
                <span className="text-[var(--color-text-disabled)]">·</span>
                <Text type="supporting" color="secondary" size="2xs">{note.readingTime}</Text>
              </span>
            </div>
          </ClickableCard>
        ))}
      </SiteSection>
    </SiteContainer>
  )
}
