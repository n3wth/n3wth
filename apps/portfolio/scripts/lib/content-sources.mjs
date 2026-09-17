/**
 * The registry of external content this site snapshots into
 * src/data/*.json: what to fetch, how to turn the response into the
 * committed shape, and what shape is valid.
 *
 * This module has no side effects and does no network I/O — it is pure
 * parsing/validation logic, shared by scripts/refresh-content.mjs (which
 * fetches, then writes) and scripts/verify-content.mjs (which reads the
 * committed files and checks them, offline). Parsers below are ported
 * verbatim from the old fetch-*.mjs build scripts; only the "never fails,
 * keep the old snapshot" fallback logic moved out, into refresh-content's
 * failure handling.
 */

// Pages that show up in the garden's feed/index but aren't notes.
const FEED_NON_NOTE_TITLES = ['Home', 'About']
const INDEX_NON_NOTE_TITLES = new Set(['Home', 'About', 'About This Vault'])

const decodeEntities = (s) =>
  s
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")

/** Serializer every snapshot file on disk uses: pretty JSON, trailing newline. */
export function canonical(value) {
  return JSON.stringify(value, null, 2) + '\n'
}

// ---------------------------------------------------------------------------
// garden-notes.json <- https://garden.n3wth.com/feed.xml (RSS)
// ---------------------------------------------------------------------------

const FEED_MAX_NOTES = 5

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))
  return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').trim() : ''
}

export function parseGardenFeed(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map(([, body]) => ({
      title: decodeEntities(tag(body, 'title')),
      href: tag(body, 'link'),
      description: decodeEntities(tag(body, 'description')),
      date: tag(body, 'pubDate'),
    }))
    // the garden's index page ships in the feed; it isn't a note
    .filter((n) => n.title && n.href && !FEED_NON_NOTE_TITLES.includes(n.title))
    .slice(0, FEED_MAX_NOTES)
}

export function validateGardenNotes(notes) {
  const errors = []
  if (!Array.isArray(notes)) {
    errors.push('garden-notes.json: expected an array')
    return errors
  }
  if (notes.length === 0) errors.push('garden-notes.json: array is empty')
  notes.forEach((note, i) => {
    for (const field of ['title', 'href', 'description', 'date']) {
      if (typeof note?.[field] !== 'string') {
        errors.push(`garden-notes.json[${i}].${field}: expected a string`)
      }
    }
    if (typeof note?.title === 'string' && note.title === '') {
      errors.push(`garden-notes.json[${i}].title: must not be empty`)
    }
    if (typeof note?.href === 'string' && note.href === '') {
      errors.push(`garden-notes.json[${i}].href: must not be empty`)
    }
  })
  return errors
}

// ---------------------------------------------------------------------------
// garden-index.json + garden-search.json <- https://garden.n3wth.com/llms.txt
// ---------------------------------------------------------------------------

// "- [Title](href)" or "- [Title](href): description"
const LINK_LINE = /^- \[(.+?)\]\((.+?)\)(?:: (.*))?$/

// Note hrefs aren't flat (/health/…, /frameworks/…, /references/books/…,
// /anki/…, or a bare slug). The "section" is the first path segment when
// there is more than one, otherwise there's no section to bucket it under.
function deriveSection(href) {
  try {
    const segments = new URL(href).pathname.split('/').filter(Boolean)
    return segments.length > 1 ? segments[0] : null
  } catch {
    return null
  }
}

/**
 * Parses the garden's llms.txt into the two shapes it feeds:
 * `index` (noteCount/indexedCount/topics, statically imported by
 * GardenShelf) and `search` (the full note list, lazy-loaded by the
 * command palette).
 */
export function parseGardenLlmsTxt(text) {
  const countMatch = text.match(/> A digital garden of (\d+) interconnected notes/)

  const topicsStart = text.indexOf('## Topics')
  const notesStart = text.indexOf('## Notes')
  if (topicsStart === -1 || notesStart === -1) {
    throw new Error('llms.txt is missing expected ## Topics / ## Notes sections')
  }

  const topics = text
    .slice(topicsStart, notesStart)
    .split('\n')
    .map((line) => {
      const m = line.match(/^- \[(.+?)\]\((.+?)\): (\d+) notes?$/)
      if (!m) return null
      return { name: decodeEntities(m[1]), href: m[2], count: Number(m[3]) }
    })
    .filter((t) => t !== null)

  const rawNotes = text
    .slice(notesStart)
    .split('\n')
    .map((line) => {
      const m = line.match(LINK_LINE)
      if (!m) return null
      const title = decodeEntities(m[1])
      const href = m[2]
      const description = m[3] ? decodeEntities(m[3]) : ''
      return { title, href, description, section: deriveSection(href) }
    })
    .filter((n) => n !== null)
    .filter((n) => n.title && n.href)
    .filter((n) => !INDEX_NON_NOTE_TITLES.has(n.title))
    .filter((n) => !new URL(n.href).pathname.startsWith('/tags/'))

  // Same title can legitimately live at two hrefs (e.g. a book note and a
  // top-level note both called "The Winner"). Dedupe on href, not title.
  const byHref = new Map()
  for (const note of rawNotes) {
    if (!byHref.has(note.href)) byHref.set(note.href, note)
  }
  const notes = [...byHref.values()].sort((a, b) => a.title.localeCompare(b.title))

  const noteCount = countMatch ? Number(countMatch[1]) : notes.length

  return {
    index: { noteCount, indexedCount: notes.length, topics },
    search: { notes },
  }
}

export function validateGardenIndex(index) {
  const errors = []
  if (typeof index !== 'object' || index === null || Array.isArray(index)) {
    errors.push('garden-index.json: expected an object')
    return errors
  }
  if (typeof index.noteCount !== 'number') errors.push('garden-index.json.noteCount: expected a number')
  if (typeof index.indexedCount !== 'number') errors.push('garden-index.json.indexedCount: expected a number')
  if (!Array.isArray(index.topics) || index.topics.length === 0) {
    errors.push('garden-index.json.topics: expected a non-empty array')
  } else {
    index.topics.forEach((topic, i) => {
      if (typeof topic?.name !== 'string' || !topic.name) {
        errors.push(`garden-index.json.topics[${i}].name: expected a non-empty string`)
      }
      if (typeof topic?.href !== 'string' || !topic.href) {
        errors.push(`garden-index.json.topics[${i}].href: expected a non-empty string`)
      }
      if (typeof topic?.count !== 'number') {
        errors.push(`garden-index.json.topics[${i}].count: expected a number`)
      }
    })
  }
  return errors
}

export function validateGardenSearch(search) {
  const errors = []
  if (typeof search !== 'object' || search === null || Array.isArray(search)) {
    errors.push('garden-search.json: expected an object')
    return errors
  }
  if (!Array.isArray(search.notes) || search.notes.length === 0) {
    errors.push('garden-search.json.notes: expected a non-empty array')
    return errors
  }
  search.notes.forEach((note, i) => {
    if (typeof note?.title !== 'string' || !note.title) {
      errors.push(`garden-search.json.notes[${i}].title: expected a non-empty string`)
    }
    if (typeof note?.href !== 'string' || !note.href) {
      errors.push(`garden-search.json.notes[${i}].href: expected a non-empty string`)
    }
  })
  return errors
}

// ---------------------------------------------------------------------------
// ui-meta.json <- https://registry.npmjs.org/@n3wth%2Fui/latest
// ---------------------------------------------------------------------------

export function parseUiRegistry(text) {
  const data = JSON.parse(text)
  return { version: typeof data.version === 'string' ? data.version : '', install: 'npm install @n3wth/ui' }
}

export function validateUiMeta(meta) {
  const errors = []
  if (typeof meta !== 'object' || meta === null || Array.isArray(meta)) {
    errors.push('ui-meta.json: expected an object')
    return errors
  }
  if (typeof meta.version !== 'string' || !/^\d+\.\d+\.\d+/.test(meta.version)) {
    errors.push('ui-meta.json.version: expected a non-empty semver-like string')
  }
  if (typeof meta.install !== 'string' || !meta.install) {
    errors.push('ui-meta.json.install: expected a non-empty string')
  }
  return errors
}

// ---------------------------------------------------------------------------
// SOURCES: the registry refresh-content.mjs and verify-content.mjs both use.
//
// `urls` is fetched in order (AbortSignal.timeout applied by the caller) and
// the resulting texts are handed to `parse` in the same order. `parse`
// returns an object keyed by filename (matching `files`) so multi-file
// sources like garden-index stay one fetch, two snapshots. `validate` takes
// that same filename-keyed object, whether it came from a fresh parse or
// from reading the committed JSON straight off disk.
// ---------------------------------------------------------------------------

export const SOURCES = [
  {
    name: 'garden-notes',
    urls: ['https://garden.n3wth.com/feed.xml'],
    files: ['garden-notes.json'],
    parse: ([feedXml]) => ({ 'garden-notes.json': parseGardenFeed(feedXml) }),
    validate: (value) => validateGardenNotes(value['garden-notes.json']),
  },
  {
    name: 'garden-index',
    urls: ['https://garden.n3wth.com/llms.txt'],
    files: ['garden-index.json', 'garden-search.json'],
    parse: ([llmsTxt]) => {
      const { index, search } = parseGardenLlmsTxt(llmsTxt)
      return { 'garden-index.json': index, 'garden-search.json': search }
    },
    validate: (value) => [
      ...validateGardenIndex(value['garden-index.json']),
      ...validateGardenSearch(value['garden-search.json']),
    ],
  },
  {
    name: 'ui-meta',
    urls: ['https://registry.npmjs.org/@n3wth%2Fui/latest'],
    files: ['ui-meta.json'],
    parse: ([registryJson]) => ({ 'ui-meta.json': parseUiRegistry(registryJson) }),
    validate: (value) => validateUiMeta(value['ui-meta.json']),
  },
]
