import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllTags } from '@/lib/content'
import { PageHeader } from '@/components/PageHeader'
import { SiteContainer, SiteSection, SiteHeading } from '@n3wth/ui/site'

import { site } from '@/lib/site'

const BASE_URL = site.url

export const metadata: Metadata = {
  title: 'Groves',
  description: 'The garden by grove — notes clustered by topic',
  alternates: { canonical: '/tags' },
  openGraph: {
    title: 'Groves',
    description: 'The garden by grove — notes clustered by topic',
    type: 'website',
    url: '/tags',
    siteName: 'n3wth/garden',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Groves',
    description: 'The garden by grove — notes clustered by topic',
  },
}

export default function TagsPage() {
  const tags = getAllTags()
  const sorted = [...tags.entries()].sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])
  )

  // A tag used once is a label, not a grove. Mixing ~120 of them into the
  // same pill field buried the ~30 topics the garden actually clusters
  // around; they get their own quieter shelf below instead.
  const groves = sorted.filter(([, notes]) => notes.length > 1)
  const singles = sorted
    .filter(([, notes]) => notes.length === 1)
    .sort((a, b) => a[0].localeCompare(b[0]))

  const maxCount = groves[0]?.[1].length || 1
  const minCount = groves[groves.length - 1]?.[1].length || 1

  // Square-rooted so the crowded 2–18 band actually separates. Linear
  // scaling against a 67-note maximum rendered two thirds of the groves
  // at an identical floor size.
  function scale(count: number): number {
    if (maxCount === minCount) return 0.5
    const norm = (v: number) => Math.sqrt(v)
    return (norm(count) - norm(minCount)) / (norm(maxCount) - norm(minCount))
  }

  function tagSize(count: number): string {
    return `${0.8125 + scale(count) * 1.1875}rem`
  }

  // Same rule as the world: the bigger something grows, the brighter it
  // reads. Floor is text-secondary — the disabled ink fails WCAG AA on
  // the pill surface, and these are all live links. Threshold sits just
  // under the sqrt-scaled position of a 12-note grove, so primary ink
  // stays reserved for groves that are genuinely large rather than
  // merely above-average.
  function tagInk(count: number): string {
    return scale(count) > 0.3
      ? 'var(--color-text-primary)'
      : 'var(--color-text-secondary)'
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Groves',
    description: `The garden by grove — ${groves.length} topic clusters where notes gather`,
    url: `${BASE_URL}/tags`,
    isPartOf: { '@type': 'WebSite', name: 'n3wth/garden', url: BASE_URL },
    author: { '@type': 'Person', name: 'Oliver Newth', url: site.parentUrl },
  }

  return (
    <SiteContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative">
        {/* A hairline grove in the header's spare right field (FLORA,
            screen-blended so its black dissolves into the page) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/grove.webp"
          alt=""
          aria-hidden
          width={340}
          height={254}
          className="hidden md:block absolute right-0 -top-8 opacity-70 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
        <PageHeader
          title="Groves"
          sub="Where notes gather by topic. The largest groves are the ones named on the ground in the garden."
        />
      </div>
      <SiteSection aria-label="Groves" className="flex flex-wrap items-baseline gap-3">
        {groves.map(([tag, notes]) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="tag-pill"
            style={{ fontSize: tagSize(notes.length), color: tagInk(notes.length) }}
          >
            {tag}
            <span className="text-[var(--color-text-secondary)]">{notes.length}</span>
          </Link>
        ))}
      </SiteSection>

      {singles.length > 0 && (
        <SiteSection className="border-t border-[var(--color-border)]">
          <SiteHeading>
            Sown once
          </SiteHeading>
          <p className="mt-1 mb-5 max-w-prose text-sm text-[var(--color-text-secondary)]">
            {singles.length} labels that have found a single note so far. Some
            will grow into groves; most are just the one plant.
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {singles.map(([tag]) => (
              <li key={tag}>
                <Link
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="text-sm text-[var(--color-text-secondary)] underline underline-offset-4 decoration-transparent hover:decoration-[var(--color-border-emphasized)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        </SiteSection>
      )}
    </SiteContainer>
  )
}
