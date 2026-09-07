import { getAllNotes, resolveWikilink } from './content'

const wikilinkRegex = /\[\[([^\[\]\|#]+)(?:#[^\[\]\|]*)?\|?([^\[\]]*?)?\]\]/g

export interface BacklinkContext {
  before: string
  mention: string
  after: string
}

export interface Backlink {
  slug: string
  title: string
  /** The sentence around the mention, split so the mention itself can be
      emphasized. Null when the link stood alone (a bare link list adds no
      context worth quoting). */
  context: BacklinkContext | null
}

let cachedBacklinks: Map<string, Backlink[]> | null = null

export function extractWikilinks(content: string): string[] {
  const links: string[] = []
  let match: RegExpExecArray | null

  const regex = new RegExp(wikilinkRegex.source, wikilinkRegex.flags)
  while ((match = regex.exec(content)) !== null) {
    const target = match[1].trim()
    if (target) links.push(target)
  }

  return [...new Set(links)]
}

/* Inline markdown -> plain text, for quoting a line of a note in the
   "Mentioned in" list. */
function stripInline(text: string): string {
  return text
    .replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?\|?([^\]]*?)\]\]/g, (_, t, a) => (a || t).trim())
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`]/g, '')
}

/* Line-leading block syntax (heading marks, list markers, blockquotes,
   task boxes) — only ever at the start of the quoted line. */
function stripLineStart(text: string): string {
  return text
    .replace(/^\s*#{1,6}\s+/, '')
    .replace(/^\s*>\s?/, '')
    .replace(/^\s*(?:[-*+]|\d+\.)\s+(?:\[[ xX]\]\s*)?/, '')
}

function truncateStart(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(-max)
  const space = cut.indexOf(' ')
  return '…' + (space === -1 ? cut : cut.slice(space + 1))
}

function truncateEnd(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return (space === -1 ? cut : cut.slice(0, space)) + '…'
}

function contextAround(content: string, matchIndex: number, matchLength: number, mention: string): BacklinkContext | null {
  const lineStart = content.lastIndexOf('\n', matchIndex - 1) + 1
  const lineEndRaw = content.indexOf('\n', matchIndex + matchLength)
  const lineEnd = lineEndRaw === -1 ? content.length : lineEndRaw

  const before = stripLineStart(stripInline(content.slice(lineStart, matchIndex))).replace(/^\s+/, '')
  const after = stripInline(content.slice(matchIndex + matchLength, lineEnd)).replace(/\s+$/, '')

  // A link standing alone on its line (MOC rows, "Related" lists) quotes
  // nothing but itself — treated as no context.
  if (!before.trim() && !after.replace(/^[\s:—–-]+/, '').trim()) return null

  return {
    before: truncateStart(before, 80),
    mention,
    after: truncateEnd(after, 100),
  }
}

export function buildBacklinks(): Map<string, Backlink[]> {
  if (cachedBacklinks) return cachedBacklinks

  const notes = getAllNotes()
  const backlinks = new Map<string, Backlink[]>()

  for (const note of notes) {
    const regex = new RegExp(wikilinkRegex.source, wikilinkRegex.flags)
    let match: RegExpExecArray | null

    while ((match = regex.exec(note.content)) !== null) {
      const target = match[1].trim()
      if (!target) continue
      const resolvedSlug = resolveWikilink(target)
      if (!resolvedSlug || resolvedSlug === note.slug) continue

      const mention = (match[2] || '').trim() || target
      const context = contextAround(note.content, match.index, match[0].length, mention)

      if (!backlinks.has(resolvedSlug)) backlinks.set(resolvedSlug, [])
      const existing = backlinks.get(resolvedSlug)!
      const prior = existing.find((b) => b.slug === note.slug)
      if (!prior) {
        existing.push({ slug: note.slug, title: note.title, context })
      } else if (!prior.context && context) {
        // First mention was a bare link; a later one carries a sentence.
        prior.context = context
      }
    }
  }

  cachedBacklinks = backlinks
  return cachedBacklinks
}

export function getBacklinksForSlug(slug: string): Backlink[] {
  const backlinks = buildBacklinks()
  return backlinks.get(slug) || []
}
