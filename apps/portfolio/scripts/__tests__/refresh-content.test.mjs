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
    const uiMeta = byName('ui-meta')
    const fetchImpl = stubFetch({
      [uiMeta.urls[0]]: { text: REGISTRY_OK },
    })

    const result = await refreshContent({
      sources: [uiMeta],
      fetchImpl,
      dataDir,
      log: () => {},
    })

    expect(result.failed).toEqual([])
    expect(result.updated.sort()).toEqual(['ui-meta'])
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

  it('leaves a failed registry snapshot untouched and reports it in failed', async () => {
    dataDir = mkdtempSync(join(tmpdir(), 'content-refresh-'))
    const uiMeta = byName('ui-meta')
    const staleUiMeta = canonical({ version: '0.9.1', install: 'npm install @n3wth/ui' })
    const uiMetaPath = join(dataDir, 'ui-meta.json')
    writeFileSync(uiMetaPath, staleUiMeta)
    vi.mocked(writeFileSync).mockClear()

    const result = await refreshContent({
      sources: [uiMeta],
      fetchImpl: stubFetch({
        [uiMeta.urls[0]]: { status: 503, text: 'Service Unavailable' },
      }),
      dataDir,
      log: () => {},
    })

    expect(result.failed).toEqual([{ name: 'ui-meta', error: expect.stringContaining('503') }])
    expect(result.updated).toEqual([])
    expect(readFileSync(uiMetaPath, 'utf8')).toBe(staleUiMeta)
    expect(writeFileSync).not.toHaveBeenCalledWith(uiMetaPath, expect.anything())
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

  it('rejects invalid registry metadata without writing a placeholder', async () => {
    dataDir = mkdtempSync(join(tmpdir(), 'content-refresh-'))
    const uiMeta = byName('ui-meta')
    const result = await refreshContent({
      fetchImpl: stubFetch({ [uiMeta.urls[0]]: { text: '{}' } }),
      dataDir,
      log: () => {},
    })
    expect(result.failed).toEqual([{ name: 'ui-meta', error: expect.stringContaining('version') }])
    expect(existsSync(join(dataDir, 'ui-meta.json'))).toBe(false)
  })

  it('rejects an unknown --only source name', async () => {
    dataDir = mkdtempSync(join(tmpdir(), 'content-refresh-'))
    await expect(
      refreshContent({ sources: SOURCES, only: 'not-a-real-source', dataDir, log: () => {} })
    ).rejects.toThrow(/unknown source/)
  })
})
