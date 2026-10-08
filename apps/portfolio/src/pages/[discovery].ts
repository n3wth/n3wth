import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { registeredPieces } from '../components/thinking/registry'
import routes from '../data/routes.json'
import notes from '../data/writing-index.json'
import summaries from '../data/piece-summaries.json'
import llmsBase from '../data/llms-base.txt?raw'
import llmsFullBase from '../data/llms-full-base.txt?raw'

const origin = 'https://n3wth.com'
const articles = registeredPieces.map(({ meta }) => ({ ...meta, updated: undefined as string | undefined }))
const entries = [...articles, ...notes.filter(note => note.date).map(note => ({ id: note.slug, title: note.title, dek: note.description, date: note.date!, updated: note.updated }))]
const xml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const date = (value: string) => new Date(value).toISOString()
const abstract = (id: string) => (summaries as Record<string, string>)[id]

export function getStaticPaths() {
  return ['sitemap.xml', 'feed.xml', 'llms.txt', 'llms-full.txt'].map(discovery => ({ params: { discovery } }))
}

export const GET: APIRoute = async ({ params }) => {
  if (params.discovery === 'sitemap.xml') {
    const docs = await getCollection('docs')
    const pages = [
      ...routes.filter(route => !route.noindex).map(route => ({ path: route.path, modified: undefined as string | undefined })),
      ...articles.map(article => ({ path: `thinking/${article.id}`, modified: article.date })),
      ...notes.map(note => ({ path: note.href.slice(1), modified: note.date ? note.updated || note.date : undefined })),
      ...docs.map((doc: { id: string }) => ({ path: doc.id.replace(/\/index$/, ''), modified: undefined })),
    ]
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(page => `  <url><loc>${xml(`${origin}/${page.path}`)}</loc>${page.modified ? `<lastmod>${page.modified}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`, { headers: { 'Content-Type': 'application/xml' } })
  }
  if (params.discovery === 'feed.xml') {
    const sorted = [...entries].sort((a, b) => date(b.updated || b.date).localeCompare(date(a.updated || a.date)))
    return new Response(`<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Thinking — Oliver Newth</title>
  <link href="${origin}/thinking" />
  <link rel="self" href="${origin}/feed.xml" />
  <id>${origin}/feed.xml</id>
  <updated>${date(sorted[0].updated || sorted[0].date)}</updated>
  <author><name>Oliver Newth</name></author>
${sorted.map(entry => `  <entry><title>${xml(entry.title)}</title><link href="${origin}/thinking/${entry.id}" /><id>${origin}/thinking/${entry.id}</id><published>${date(entry.date)}</published><updated>${date(entry.updated || entry.date)}</updated><summary>${xml(abstract(entry.id) || entry.dek)}</summary></entry>`).join('\n')}
</feed>\n`, { headers: { 'Content-Type': 'application/atom+xml' } })
  }
  const base = (params.discovery === 'llms.txt' ? llmsBase : llmsFullBase).trimEnd()
  const thinking = params.discovery === 'llms.txt'
    ? `\n\n## Thinking\n\n${articles.map(article => `- [${article.title}](${origin}/thinking/${article.id}): ${article.dek}`).join('\n')}\n`
    : `\n\n${articles.filter(article => abstract(article.id)).map(article => `# ${article.title} (${article.date})\n${origin}/thinking/${article.id}\n\n${abstract(article.id)}`).join('\n\n---\n\n')}\n`
  const writing = `\n## Notes\n\n${notes.map(note => `- [${note.title}](${origin}${note.href}): ${note.description}`).join('\n')}\n`
  return new Response(base + thinking + writing, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
