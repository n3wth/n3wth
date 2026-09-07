import { getAllNotes, type GrowthStage } from './content'
import { getGraphData } from './graph'

export interface NotePreview {
  title: string
  excerpt: string
  tags: string[]
  stage: GrowthStage
  readingTime: string
  linkCount: number
  /** Preformatted "Mon YYYY" of the note's first commit, when known. */
  planted?: string
}

let cachedPreviews: Record<string, NotePreview> | null = null

function extractExcerpt(content: string, maxLength: number = 150): string {
  // Strip markdown syntax for clean excerpt
  const cleaned = content
    .replace(/^#+ .+$/gm, '') // headings
    .replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (_, target, __, alias) => alias || target) // wikilinks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // markdown links
    .replace(/[*_~`]/g, '') // emphasis
    .replace(/^>\s?/gm, '') // blockquotes
    .replace(/^[-*+]\s/gm, '') // list markers
    .replace(/^\d+\.\s/gm, '') // ordered list markers
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/\n{2,}/g, '\n')
    .trim()

  const firstPara = cleaned.split('\n').find((line) => line.trim().length > 20)
  if (!firstPara) return cleaned.slice(0, maxLength)

  return firstPara.length > maxLength
    ? firstPara.slice(0, maxLength).replace(/\s\S*$/, '') + '...'
    : firstPara
}

export function getAllPreviews(): Record<string, NotePreview> {
  if (cachedPreviews) return cachedPreviews

  const notes = getAllNotes()
  const graph = new Map(getGraphData().nodes.map((n) => [n.id, n]))
  const previews: Record<string, NotePreview> = {}

  for (const note of notes) {
    const g = graph.get(note.slug)
    previews[note.slug] = {
      title: note.title,
      excerpt: extractExcerpt(note.content),
      tags: note.tags.slice(0, 3),
      stage: note.stage,
      readingTime: note.readingTime,
      linkCount: g?.linkCount ?? 0,
      planted: g?.created
        ? new Date(g.created).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : undefined,
    }
  }

  cachedPreviews = previews
  return previews
}
