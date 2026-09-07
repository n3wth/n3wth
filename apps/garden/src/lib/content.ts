import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import GithubSlugger from 'github-slugger'
import readingTime from 'reading-time'

const slugger = new GithubSlugger()

export type GrowthStage = 'seedling' | 'budding' | 'evergreen'

export interface NoteMeta {
  title: string
  slug: string
  description?: string
  tags: string[]
  date?: string
  readingTime: string
  filePath: string
  draft?: boolean
  stage: GrowthStage
  wordCount: number
  /** Who the note assumes is reading (rendered as an aside under the header). */
  audience?: string
}

export interface NoteData extends NoteMeta {
  content: string
  rawContent: string
}

const CONTENT_DIR = path.join(process.cwd(), 'content')

const STAGES: GrowthStage[] = ['seedling', 'budding', 'evergreen']

/* Notes written in Obsidian use the Note Status Guide's taxonomy
   (status: seed | seedling | evergreen); the site renders three stages
   (seedling | budding | evergreen). Map by position, not by name —
   the guide's "seedling" is its middle stage, which is "budding" here.
   Unknown values (e.g. status: reading on book notes) fall through to
   the word-count inference. */
const STATUS_TO_STAGE: Record<string, GrowthStage> = {
  seed: 'seedling',
  seedling: 'budding',
  evergreen: 'evergreen',
}

function frontmatterStage(data: Record<string, unknown>): GrowthStage | undefined {
  if (typeof data.stage === 'string') {
    const stage = data.stage.toLowerCase().trim() as GrowthStage
    if (STAGES.includes(stage)) return stage
  }
  if (typeof data.status === 'string') {
    return STATUS_TO_STAGE[data.status.toLowerCase().trim()]
  }
  return undefined
}

const IGNORE_DIRS = ['Attachments', 'space', 'space 1', 'Tags']
const IGNORE_FILES = ['build_knowledge_graph.py']

function fileToSlug(filePath: string): string {
  const relative = path.relative(CONTENT_DIR, filePath)
  const withoutExt = relative.replace(/\.md$/, '')
  // index files (any case) -> parent dir slug
  const lower = withoutExt.toLowerCase()
  if (lower.endsWith('/index') || lower === 'index') {
    const parent = withoutExt.replace(/\/?[Ii]ndex$/, '')
    if (!parent) return ''
    return parent
      .split('/')
      .map((part) => slugifyPart(part))
      .join('/')
  }
  return withoutExt
    .split('/')
    .map((part) => slugifyPart(part))
    .join('/')
}

function slugifyPart(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

let cachedNotes: NoteData[] | null = null
let cachedSlugMap: Map<string, NoteData> | null = null
let cachedTitleMap: Map<string, string> | null = null

function scanFiles(dir: string): string[] {
  const results: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.includes(entry.name)) continue
      results.push(...scanFiles(path.join(dir, entry.name)))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      if (IGNORE_FILES.includes(entry.name)) continue
      results.push(path.join(dir, entry.name))
    }
  }

  return results
}

export function getAllNotes(): NoteData[] {
  if (cachedNotes) return cachedNotes

  const files = scanFiles(CONTENT_DIR)
  const notes: NoteData[] = []

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)

    const slug = fileToSlug(filePath)
    const fileName = path.basename(filePath, '.md')
    const title = data.title || (fileName.toLowerCase() === 'index' ? path.basename(path.dirname(filePath)) : fileName)
    const tags = Array.isArray(data.tags) ? data.tags.map((t: string) => t.toLowerCase().trim()) : []
    const rt = readingTime(content)
    const wc = rt.words
    const headingCount = (content.match(/^#{1,4}\s/gm) || []).length
    const stage: GrowthStage = frontmatterStage(data)
      || (wc > 800 && headingCount > 5 ? 'evergreen'
        : wc >= 200 || headingCount >= 2 ? 'budding'
        : 'seedling')

    notes.push({
      title,
      slug,
      description: data.description || '',
      tags,
      date: data.date ? String(data.date) : undefined,
      readingTime: rt.text,
      filePath: path.relative(CONTENT_DIR, filePath),
      draft: data.draft === true,
      stage,
      wordCount: wc,
      audience: typeof data.audience === 'string' ? data.audience : undefined,
      content,
      rawContent: raw,
    })
  }

  cachedNotes = notes.filter((n) => !n.draft)
  return cachedNotes
}

export function getSlugMap(): Map<string, NoteData> {
  if (cachedSlugMap) return cachedSlugMap

  const notes = getAllNotes()
  const map = new Map<string, NoteData>()

  for (const note of notes) {
    map.set(note.slug, note)
  }

  cachedSlugMap = map
  return map
}

// Map from lowercase title/filename -> slug for wikilink resolution
export function getTitleToSlugMap(): Map<string, string> {
  if (cachedTitleMap) return cachedTitleMap

  const notes = getAllNotes()
  const map = new Map<string, string>()

  for (const note of notes) {
    // Map title (lowercased)
    map.set(note.title.toLowerCase(), note.slug)

    // Map filename without extension (lowercased)
    const fileName = path.basename(note.filePath, '.md').toLowerCase()
    if (!map.has(fileName)) {
      map.set(fileName, note.slug)
    }

    // Map slug itself
    const lastSegment = note.slug.split('/').pop()
    if (lastSegment && !map.has(lastSegment)) {
      map.set(lastSegment, note.slug)
    }
  }

  cachedTitleMap = map
  return map
}

export function getNoteBySlug(slug: string): NoteData | undefined {
  return getSlugMap().get(slug)
}

/* The home index ('') and the /notes shadow slug aren't notes a reader
   can count or visit as notes — every reader-facing collection excludes
   them through this one predicate. */
export function isPublishedNote(note: Pick<NoteData, 'slug'>): boolean {
  return note.slug !== '' && note.slug !== 'notes'
}

export function getPublishedNotes(): NoteData[] {
  return getAllNotes().filter(isPublishedNote)
}

/* One number for "how many notes are in the garden", used by every page
   (and route: OG image, llms.txt) that states a count. */
export function getPublishedNoteCount(): number {
  return getPublishedNotes().length
}

export function getAllTags(): Map<string, NoteData[]> {
  const notes = getPublishedNotes()
  const tags = new Map<string, NoteData[]>()

  for (const note of notes) {
    for (const tag of note.tags) {
      if (!tags.has(tag)) tags.set(tag, [])
      tags.get(tag)!.push(note)
    }
  }

  return tags
}

export function resolveWikilink(target: string): string | null {
  const titleMap = getTitleToSlugMap()

  // Try exact match first
  const lower = target.toLowerCase().trim()
  if (titleMap.has(lower)) return titleMap.get(lower)!

  // Try with path component (e.g., "Health/Sleep" -> "health/sleep")
  const slugified = target
    .split('/')
    .map((p) => slugifyPart(p))
    .join('/')
  const slugMap = getSlugMap()
  if (slugMap.has(slugified)) return slugified

  // Index files collapse to their parent dir slug (e.g., "Health/Index" -> "health")
  const collapsed = slugified.replace(/\/index$/, '')
  if (collapsed !== slugified && slugMap.has(collapsed)) return collapsed

  // Try just the last segment
  const lastPart = lower.split('/').pop()
  if (lastPart && titleMap.has(lastPart)) return titleMap.get(lastPart)!

  return null
}
