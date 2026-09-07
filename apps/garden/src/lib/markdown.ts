import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'
import { remarkWikilinks } from '@/plugins/remark-wikilinks'
import { remarkCallouts } from '@/plugins/remark-callouts'
import { remarkStripDataview } from '@/plugins/remark-strip-dataview'
import { remarkStripTitle } from '@/plugins/remark-strip-title'
import { rehypeRichContent } from '@/plugins/rehype-rich-content'

export async function markdownToHtml(content: string, { stripTitle = true }: { stripTitle?: boolean } = {}): Promise<string> {
  let pipeline = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkStripDataview)
  if (stripTitle) pipeline = pipeline.use(remarkStripTitle)
  const result = await pipeline
    .use(remarkCallouts)
    .use(remarkWikilinks)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: { className: 'heading-link' },
    })
    .use(rehypeRichContent)
    .use(rehypeStringify)
    .process(content)

  return String(result)
}

// Extract headings for TOC
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

/** Decode the HTML entities rehype-stringify emits so heading text reads
    as plain text in the TOC ("&" instead of "&amp;"). */
function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const code =
        entity[1].toLowerCase() === 'x'
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : match
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match
  })
}

export function extractHeadings(html: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = []
  const regex = /<h([2-4])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[2-4]>/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1])
    const id = match[2]
    // Strip HTML tags, then decode entities in the remaining text
    const text = decodeEntities(match[3].replace(/<[^>]*>/g, ''))
    headings.push({ id, text, level })
  }

  return headings
}
