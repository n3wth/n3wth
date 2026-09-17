import { describe, it, expect, afterEach, vi } from 'vitest'
import { mkdtempSync, rmSync, readFileSync, existsSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { refreshContent } from '../refresh-content.mjs'
import { SOURCES, canonical } from '../lib/content-sources.mjs'

// Spy on the real writeFileSync (still functional) so tests can assert a
// failed or unchanged source's file was never touched, not just that its
// bytes happen to match afterwards.
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, writeFileSync: vi.fn(actual.writeFileSync) }
})

const FEED_OK = `<?xml version="1.0"?><rss><channel>
<item><title>A Note</title><link>https://garden.n3wth.com/a-note</link><description>d</description><pubDate>Mon, 01 Jan 2026 00:00:00 GMT</pubDate></item>
</channel></rss>`

const FEED_ZERO_NOTES = `<?xml version="1.0"?><rss><channel>
<item><title>Home</title><link>https://garden.n3wth.com/</link><description>d</description><pubDate>Mon, 01 Jan 2026 00:00:00 GMT</pubDate></item>
</channel></rss>`

const LLMS_TXT_OK = `> A digital garden of 1 interconnected notes.

## Topics

- [books](https://garden.n3wth.com/tags/books): 1 notes

## Notes

- [A Note](https://garden.n3wth.com/a-note): a note
`

const REGISTRY_OK = JSON.stringify({ version: '2.1.0' })

function byName(name) {
  const source = SOURCES.find((s) => s.name === name)
  if (!source) throw new Error(`no source named ${name}`)
  return source
}

function stubFetch(byUrl) {
  return async (url) => {
    const entry = byUrl[url]
    if (!entry) throw new Error(`unexpected fetch: ${url}`)
    return {
      ok: entry.status === undefined || entry.status < 400,
      status: entry.status ?? 200,
      text: async () => entry.text,
    }
  }
}

let dataDir

afterEach(() => {
  if (dataDir) rmSync(dataDir, { recursive: true, force: true })
  dataDir = undefined
  vi.mocked(writeFileSync).mockClear()
})

describe('refreshContent', () => {
  it('writes canonical files for every source that fetches and validates cleanly', async () => {
    dataDir = mkdtempSync(join(tmpdir(), 'content-refresh-'))
    const gardenNotes = byName('garden-notes')
    const uiMeta = byName('ui-meta')
    const fetchImpl = stubFetch({
      [gardenNotes.urls[0]]: { text: FEED_OK },
      [uiMeta.urls[0]]: { text: REGISTRY_OK },
    })

    const result = await refreshContent({
      sources: [gardenNotes, uiMeta],
      fetchImpl,
      dataDir,
      log: () => {},
    })

    expect(result.failed).toEqual([])
    expect(result.updated.sort()).toEqual(['garden-notes', 'ui-meta'])
    expect(readFileSync(join(dataDir, 'garden-notes.json'), 'utf8')).toBe(
      canonical([
        {
          title: 'A Note',
          href: 'https://garden.n3wth.com/a-note',
          description: 'd',
          date: 'Mon, 01 Jan 2026 00:00:00 GMT',
        },
      ])
    )
    expect(JSON.parse(readFileSync(join(dataDir, 'ui-meta.json'), 'utf8'))).toEqual({
      version: '2.1.0',
      install: 'npm install @n3wth/ui',
    })
  })

  it('does not rewrite a file when the fetched content is byte-identical to what is on disk', async () => {
    dataDir = mkdtempSync(join(tmpdir(), 'content-refresh-'))
    const uiMeta = byName('ui-meta')
    const path = join(dataDir, 'ui-meta.json')
    writeFileSync(path, canonical({ version: '2.1.0', install: 'npm install @n3wth/ui' }))
    vi.mocked(writeFileSync).mockClear()

    const result = await refreshContent({
      sources: [uiMeta],
      fetchImpl: stubFetch({ [uiMeta.urls[0]]: { text: REGISTRY_OK } }),
      dataDir,
      log: () => {},
    })

    expect(result.failed).toEqual([])
    expect(result.unchanged).toEqual(['ui-meta'])
    expect(result.updated).toEqual([])
    expect(writeFileSync).not.toHaveBeenCalled()
  })

  it('leaves a failed source untouched, writes the others, and reports it in failed', async () => {
    dataDir = mkdtempSync(join(tmpdir(), 'content-refresh-'))
    const gardenNotes = byName('garden-notes')
    const uiMeta = byName('ui-meta')
    const staleUiMeta = canonical({ version: '0.9.1', install: 'npm install @n3wth/ui' })
    const uiMetaPath = join(dataDir, 'ui-meta.json')
    writeFileSync(uiMetaPath, staleUiMeta)
    vi.mocked(writeFileSync).mockClear()

    const result = await refreshContent({
      sources: [gardenNotes, uiMeta],
      fetchImpl: stubFetch({
        [gardenNotes.urls[0]]: { text: FEED_OK },
        [uiMeta.urls[0]]: { status: 503, text: 'Service Unavailable' },
      }),
      dataDir,
      log: () => {},
    })

    expect(result.failed).toEqual([{ name: 'ui-meta', error: expect.stringContaining('503') }])
    expect(result.updated).toEqual(['garden-notes'])
    expect(readFileSync(uiMetaPath, 'utf8')).toBe(staleUiMeta)
    expect(existsSync(join(dataDir, 'garden-notes.json'))).toBe(true)
    expect(writeFileSync).not.toHaveBeenCalledWith(uiMetaPath, expect.anything())
  })

  it('treats a feed that parses to zero notes as a failure, not an empty write', async () => {
    dataDir = mkdtempSync(join(tmpdir(), 'content-refresh-'))
    const gardenNotes = byName('garden-notes')

    const result = await refreshContent({
      sources: [gardenNotes],
      fetchImpl: stubFetch({ [gardenNotes.urls[0]]: { text: FEED_ZERO_NOTES } }),
      dataDir,
      log: () => {},
    })

    expect(result.failed).toEqual([{ name: 'garden-notes', error: expect.stringContaining('empty') }])
    expect(result.updated).toEqual([])
    expect(existsSync(join(dataDir, 'garden-notes.json'))).toBe(false)
  })

  it('a single-fetch source that feeds two files writes both on success', async () => {
    dataDir = mkdtempSync(join(tmpdir(), 'content-refresh-'))
    const gardenIndex = byName('garden-index')

    const result = await refreshContent({
      sources: [gardenIndex],
      fetchImpl: stubFetch({ [gardenIndex.urls[0]]: { text: LLMS_TXT_OK } }),
      dataDir,
      log: () => {},
    })

    expect(result.failed).toEqual([])
    expect(result.updated).toEqual(['garden-index'])
    expect(existsSync(join(dataDir, 'garden-index.json'))).toBe(true)
    expect(existsSync(join(dataDir, 'garden-search.json'))).toBe(true)
  })

  it('--only narrows the run to a single named source', async () => {
    dataDir = mkdtempSync(join(tmpdir(), 'content-refresh-'))
    const uiMeta = byName('ui-meta')

    const result = await refreshContent({
      sources: SOURCES,
      only: 'ui-meta',
      fetchImpl: stubFetch({ [uiMeta.urls[0]]: { text: REGISTRY_OK } }),
      dataDir,
      log: () => {},
    })

    expect(result.updated).toEqual(['ui-meta'])
    expect(result.unchanged).toEqual([])
    expect(result.failed).toEqual([])
    expect(existsSync(join(dataDir, 'garden-notes.json'))).toBe(false)
  })

  it('rejects an unknown --only source name', async () => {
    dataDir = mkdtempSync(join(tmpdir(), 'content-refresh-'))
    await expect(
      refreshContent({ sources: SOURCES, only: 'not-a-real-source', dataDir, log: () => {} })
    ).rejects.toThrow(/unknown source/)
  })
})
