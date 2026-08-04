/**
 * Build-time snapshot of the garden's full note index
 * (garden.n3wth.com/llms.txt), for the /library and command-palette
 * surfaces to search all 248 garden notes without a client-side fetch.
 * Same contract as fetch-garden-notes.mjs: never fails the build, never
 * invents content — on any error the committed snapshot is left
 * untouched.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/* Two files, on purpose. The shape of the garden (its note count and its
   fifteen topics) renders immediately on /library, so it's a static import.
   The note list is ~50KB and only the ⌘K palette ever reads it, so it lives
   apart and is pulled in on first open — a single file statically imported
   anywhere would drag all 245 notes into the main bundle. */
const DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/data')
const OUT = join(DIR, 'garden-index.json')
const OUT_SEARCH = join(DIR, 'garden-search.json')
const SOURCE = 'https://garden.n3wth.com/llms.txt'

// Pages that show up in llms.txt but aren't notes.
const NON_NOTE_TITLES = new Set(['Home', 'About', 'About This Vault'])

const decode = (s) =>
  s
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")

// "- [Title](href)" or "- [Title](href): description"
const LINK_LINE = /^- \[(.+?)\]\((.+?)\)(?:: (.*))?$/

// Note hrefs aren't flat (/health/…, /frameworks/…, /references/books/…,
// /anki/…, or a bare slug). The "section" is the first path segment when
// there is more than one, otherwise there's no section to bucket it under.
const deriveSection = (href) => {
  try {
    const segments = new URL(href).pathname.split('/').filter(Boolean)
    return segments.length > 1 ? segments[0] : null
  } catch {
    return null
  }
}

try {
  const res = await fetch(SOURCE, { signal: AbortSignal.timeout(10_000) })
  if (!res.ok) throw new Error(`llms.txt ${res.status}`)
  const text = await res.text()

  const countMatch = text.match(/> A digital garden of (\d+) interconnected notes/)

  const topicsStart = text.indexOf('## Topics')
  const notesStart = text.indexOf('## Notes')
  if (topicsStart === -1 || notesStart === -1) throw new Error('llms.txt is missing expected sections')

  const topics = text
    .slice(topicsStart, notesStart)
    .split('\n')
    .map((line) => {
      const m = line.match(/^- \[(.+?)\]\((.+?)\): (\d+) notes?$/)
      if (!m) return null
      return { name: decode(m[1]), href: m[2], count: Number(m[3]) }
    })
    .filter((t) => t !== null)

  const rawNotes = text
    .slice(notesStart)
    .split('\n')
    .map((line) => {
      const m = line.match(LINK_LINE)
      if (!m) return null
      const title = decode(m[1])
      const href = m[2]
      const description = m[3] ? decode(m[3]) : ''
      return { title, href, description, section: deriveSection(href) }
    })
    .filter((n) => n !== null)
    .filter((n) => n.title && n.href)
    .filter((n) => !NON_NOTE_TITLES.has(n.title))
    .filter((n) => !new URL(n.href).pathname.startsWith('/tags/'))

  // Same title can legitimately live at two hrefs (e.g. a book note and a
  // top-level note both called "The Winner"). Dedupe on href, not title.
  const byHref = new Map()
  for (const note of rawNotes) {
    if (!byHref.has(note.href)) byHref.set(note.href, note)
  }
  const notes = [...byHref.values()].sort((a, b) => a.title.localeCompare(b.title))

  if (notes.length === 0) throw new Error('llms.txt parsed to zero notes')

  const noteCount = countMatch ? Number(countMatch[1]) : notes.length

  // noteCount is the garden's own headline number; indexedCount is how many
  // real notes survived filtering, and the two differ by the handful of index
  // pages llms.txt lists alongside the notes.
  writeFileSync(
    OUT,
    JSON.stringify({ noteCount, indexedCount: notes.length, topics }, null, 2) + '\n'
  )
  writeFileSync(OUT_SEARCH, JSON.stringify({ notes }, null, 2) + '\n')
  console.log(
    `[garden-index] snapshot updated: ${noteCount} notes counted, ${notes.length} indexed, ${topics.length} topics`
  )
} catch (err) {
  try {
    readFileSync(OUT, 'utf8')
    readFileSync(OUT_SEARCH, 'utf8')
    console.warn(`[garden-index] fetch failed (${err.message}); keeping committed snapshot`)
  } catch {
    writeFileSync(OUT, JSON.stringify({ noteCount: 0, indexedCount: 0, topics: [] }, null, 2) + '\n')
    writeFileSync(OUT_SEARCH, JSON.stringify({ notes: [] }, null, 2) + '\n')
    console.warn(`[garden-index] fetch failed (${err.message}); wrote empty snapshot`)
  }
}
