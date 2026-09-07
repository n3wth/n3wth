import { getPublishedNotes } from '@/lib/content'
import { getGraphData } from '@/lib/graph'
import { site } from '@/lib/site'

export const dynamic = 'force-static'

const BASE_URL = site.url

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** RSS 2.0 feed of the most recently tended notes — the garden's
    syndication surface for feed readers and aggregators. */
export function GET() {
  const modified = new Map(getGraphData().nodes.map((n) => [n.id, n.modified ?? 0]))
  const notes = getPublishedNotes()
    .map((n) => ({ ...n, modifiedMs: modified.get(n.slug) ?? 0 }))
    .sort((a, b) => b.modifiedMs - a.modifiedMs)
    .slice(0, 30)

  const items = notes
    .map((n) => {
      const url = `${BASE_URL}/${n.slug}`
      const pubDate = n.modifiedMs ? new Date(n.modifiedMs).toUTCString() : undefined
      return [
        '    <item>',
        `      <title>${esc(n.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        n.description ? `      <description>${esc(n.description)}</description>` : null,
        pubDate ? `      <pubDate>${pubDate}</pubDate>` : null,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>n3wth/garden</title>
    <link>${BASE_URL}</link>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>A digital garden of growing ideas — the most recently tended notes.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
