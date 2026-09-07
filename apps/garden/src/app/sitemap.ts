import type { MetadataRoute } from 'next'
import { getAllTags, isPublishedNote } from '@/lib/content'
import { getGraphData } from '@/lib/graph'

import { site } from '@/lib/site'

const BASE_URL = site.url

/* The garden already knows which notes are mature and which were tended
   last week. Crawlers were being told none of it: every URL went out
   bare, and lastModified came from an optional frontmatter `date` most
   notes never set. Growth stage is the honest priority signal here — an
   evergreen is the page worth indexing deeply, a seedling is a page that
   will look different next month. */
const STAGE_PRIORITY = { evergreen: 0.8, budding: 0.6, seedling: 0.4 } as const

function changeFrequency(modified?: number): MetadataRoute.Sitemap[number]['changeFrequency'] {
  if (!modified) return 'yearly'
  const days = (Date.now() - modified) / 86400000
  if (days < 30) return 'weekly'
  if (days < 180) return 'monthly'
  return 'yearly'
}

export default function sitemap(): MetadataRoute.Sitemap {
  const nodes = getGraphData().nodes.filter(
    (n) => n.id !== '' && isPublishedNote({ slug: n.id })
  )

  const notes = nodes.map((n) => ({
    url: `${BASE_URL}/${n.id}`,
    lastModified: n.modified ? new Date(n.modified) : undefined,
    changeFrequency: changeFrequency(n.modified),
    priority: STAGE_PRIORITY[n.stage as keyof typeof STAGE_PRIORITY] ?? 0.5,
  }))

  // A grove is only worth crawling in proportion to what grows in it;
  // the ~116 single-note tags are duplicate views of one note.
  const tags = [...getAllTags().entries()].map(([tag, tagged]) => ({
    url: `${BASE_URL}/tags/${encodeURIComponent(tag)}`,
    changeFrequency: 'monthly' as const,
    priority: tagged.length > 1 ? 0.4 : 0.2,
  }))

  const newest = nodes.reduce((max, n) => Math.max(max, n.modified ?? 0), 0)
  const lastTended = newest ? new Date(newest) : undefined

  return [
    { url: BASE_URL, lastModified: lastTended, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/notes`, lastModified: lastTended, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/tags`, lastModified: lastTended, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/graph`, lastModified: lastTended, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE_URL}/world`, lastModified: lastTended, changeFrequency: 'weekly', priority: 0.5 },
    ...notes,
    ...tags,
  ]
}
