import { getPublishedNotes, getAllTags } from '@/lib/content'
import { site } from '@/lib/site'

export const dynamic = 'force-static'

const BASE_URL = site.url

/** llms.txt (llmstxt.org) — a machine-readable index of the garden for
    AI crawlers and answer engines. */
export function GET() {
  const notes = getPublishedNotes()
    .sort((a, b) => a.title.localeCompare(b.title))

  const topTags = [...getAllTags().entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 15)

  const lines = [
    '# n3wth/garden',
    '',
    `> A digital garden of ${notes.length} interconnected notes on careers, learning, health, and building things, written by Oliver Newth (${site.parentUrl}). Notes grow from seedlings into evergreens and are densely cross-linked.`,
    '',
    'Notes are served as standard HTML pages with semantic headings, JSON-LD Article metadata, and internal wikilinks between related notes.',
    '',
    '## Topics',
    '',
    ...topTags.map(
      ([tag, tagged]) =>
        `- [${tag}](${BASE_URL}/tags/${encodeURIComponent(tag)}): ${tagged.length} notes`
    ),
    '',
    '## Notes',
    '',
    ...notes.map((n) =>
      n.description
        ? `- [${n.title}](${BASE_URL}/${n.slug}): ${n.description}`
        : `- [${n.title}](${BASE_URL}/${n.slug})`
    ),
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
