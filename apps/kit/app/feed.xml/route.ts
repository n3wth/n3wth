import { siteUrls } from '@n3wth/site-config'
import { posts } from '../blog/posts'

export const dynamic = 'force-static'

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

export function GET() {
  const items = posts.map((post) => {
    const url = `${siteUrls.kit}/blog/${post.slug}`

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedIso).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>n3wth/kit Blog</title>
    <link>${siteUrls.kit}/blog</link>
    <description>Notes on registries, context packs, and generated UI.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date(posts[0].publishedIso).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
