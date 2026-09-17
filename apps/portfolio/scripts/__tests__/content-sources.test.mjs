import { describe, it, expect } from 'vitest'
import {
  parseGardenFeed,
  parseGardenLlmsTxt,
  parseUiRegistry,
  validateGardenNotes,
  validateGardenIndex,
  validateGardenSearch,
  validateUiMeta,
  canonical,
  SOURCES,
} from '../lib/content-sources.mjs'

const FEED_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<item><title>Home</title><link>https://garden.n3wth.com/</link><description>Index</description><pubDate>Mon, 01 Jan 2026 00:00:00 GMT</pubDate></item>
<item><title>About</title><link>https://garden.n3wth.com/about</link><description>About the garden</description><pubDate>Mon, 01 Jan 2026 00:00:00 GMT</pubDate></item>
<item><title><![CDATA[Rocks &amp; Rivers]]></title><link>https://garden.n3wth.com/rocks-and-rivers</link><description><![CDATA[A note about rocks &amp; rivers]]></description><pubDate>Tue, 02 Jan 2026 00:00:00 GMT</pubDate></item>
<item><title>Second Note</title><link>https://garden.n3wth.com/second-note</link><description>The second one</description><pubDate>Wed, 03 Jan 2026 00:00:00 GMT</pubDate></item>
</channel></rss>`

const LLMS_TXT_FIXTURE = `# Garden

> A digital garden of 3 interconnected notes.

## Topics

- [books](https://garden.n3wth.com/tags/books): 2 notes
- [health](https://garden.n3wth.com/tags/health): 1 note

## Notes

- [Home](https://garden.n3wth.com/)
- [About This Vault](https://garden.n3wth.com/about)
- [Some Tag Page](https://garden.n3wth.com/tags/books)
- [5 Whys](https://garden.n3wth.com/frameworks/5-whys): A framework for root causes
- [A Book Note](https://garden.n3wth.com/references/books/a-book-note): Notes on a book
- [Duplicate Href](https://garden.n3wth.com/frameworks/5-whys): Same href, different title
`

const REGISTRY_FIXTURE = JSON.stringify({ version: '2.1.0', name: '@n3wth/ui' })

describe('parseGardenFeed', () => {
  it('filters Home/About and caps at 5 notes', () => {
    const notes = parseGardenFeed(FEED_FIXTURE)
    expect(notes.map((n) => n.title)).toEqual(['Rocks & Rivers', 'Second Note'])
  })

  it('decodes HTML entities in title and description', () => {
    const [note] = parseGardenFeed(FEED_FIXTURE)
    expect(note.title).toBe('Rocks & Rivers')
    expect(note.description).toBe('A note about rocks & rivers')
  })

  it('keeps href and date as parsed from the feed', () => {
    const [note] = parseGardenFeed(FEED_FIXTURE)
    expect(note.href).toBe('https://garden.n3wth.com/rocks-and-rivers')
    expect(note.date).toBe('Tue, 02 Jan 2026 00:00:00 GMT')
  })
})

describe('parseGardenLlmsTxt', () => {
  it('parses topics with counts', () => {
    const { index } = parseGardenLlmsTxt(LLMS_TXT_FIXTURE)
    expect(index.topics).toEqual([
      { name: 'books', href: 'https://garden.n3wth.com/tags/books', count: 2 },
      { name: 'health', href: 'https://garden.n3wth.com/tags/health', count: 1 },
    ])
  })

  it('reads the headline note count from the garden summary line', () => {
    const { index } = parseGardenLlmsTxt(LLMS_TXT_FIXTURE)
    expect(index.noteCount).toBe(3)
  })

  it('filters Home/About This Vault and /tags/ pages out of the note list', () => {
    const { search } = parseGardenLlmsTxt(LLMS_TXT_FIXTURE)
    const titles = search.notes.map((n) => n.title)
    expect(titles).not.toContain('Home')
    expect(titles).not.toContain('About This Vault')
    expect(titles).not.toContain('Some Tag Page')
  })

  it('dedupes notes by href, not title', () => {
    const { search } = parseGardenLlmsTxt(LLMS_TXT_FIXTURE)
    const hrefs = search.notes.map((n) => n.href)
    expect(hrefs.filter((h) => h === 'https://garden.n3wth.com/frameworks/5-whys')).toHaveLength(1)
  })

  it('derives a section from the first path segment', () => {
    const { search } = parseGardenLlmsTxt(LLMS_TXT_FIXTURE)
    const bookNote = search.notes.find((n) => n.href.includes('a-book-note'))
    expect(bookNote.section).toBe('references')
  })

  it('throws when the expected sections are missing', () => {
    expect(() => parseGardenLlmsTxt('no sections here')).toThrow()
  })
})

describe('parseUiRegistry', () => {
  it('extracts version and a fixed install line', () => {
    expect(parseUiRegistry(REGISTRY_FIXTURE)).toEqual({
      version: '2.1.0',
      install: 'npm install @n3wth/ui',
    })
  })

  it('falls back to an empty version when the field is missing', () => {
    expect(parseUiRegistry(JSON.stringify({ name: '@n3wth/ui' })).version).toBe('')
  })
})

describe('validators reject empty/placeholder shapes', () => {
  it('validateGardenNotes rejects an empty array', () => {
    expect(validateGardenNotes([])).not.toEqual([])
  })

  it('validateGardenNotes rejects a non-array', () => {
    expect(validateGardenNotes({})).not.toEqual([])
  })

  it('validateGardenNotes accepts a well-formed array', () => {
    expect(
      validateGardenNotes([{ title: 'A', href: 'https://x', description: '', date: '' }])
    ).toEqual([])
  })

  it('validateGardenIndex rejects empty topics', () => {
    expect(validateGardenIndex({ noteCount: 1, indexedCount: 1, topics: [] })).not.toEqual([])
  })

  it('validateGardenSearch rejects an empty notes array', () => {
    expect(validateGardenSearch({ notes: [] })).not.toEqual([])
  })

  it('validateGardenSearch rejects a note missing a title or href', () => {
    expect(validateGardenSearch({ notes: [{ title: '', href: 'https://x' }] })).not.toEqual([])
    expect(validateGardenSearch({ notes: [{ title: 'A', href: '' }] })).not.toEqual([])
  })

  it('validateGardenSearch accepts a well-formed notes array', () => {
    expect(validateGardenSearch({ notes: [{ title: 'A', href: 'https://x' }] })).toEqual([])
  })

  it('validateUiMeta rejects a blank version (the pre-fix placeholder)', () => {
    expect(validateUiMeta({ version: '', install: 'npm install @n3wth/ui' })).not.toEqual([])
  })

  it('validateUiMeta accepts a semver-like version', () => {
    expect(validateUiMeta({ version: '2.0.0', install: 'npm install @n3wth/ui' })).toEqual([])
  })
})

describe('canonical', () => {
  it('pretty-prints with a trailing newline', () => {
    expect(canonical({ a: 1 })).toBe('{\n  "a": 1\n}\n')
  })
})

describe('SOURCES', () => {
  it('has one entry per known content source', () => {
    expect(SOURCES.map((s) => s.name).sort()).toEqual(['garden-index', 'garden-notes', 'ui-meta'].sort())
  })

  it('every source has matching urls, files, parse and validate', () => {
    for (const source of SOURCES) {
      expect(Array.isArray(source.urls) && source.urls.length > 0).toBe(true)
      expect(Array.isArray(source.files) && source.files.length > 0).toBe(true)
      expect(typeof source.parse).toBe('function')
      expect(typeof source.validate).toBe('function')
    }
  })
})
