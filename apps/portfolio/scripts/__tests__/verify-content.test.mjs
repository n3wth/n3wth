import { describe, it, expect, afterEach } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, unlinkSync, copyFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyContent } from '../verify-content.mjs'
import { SNAPSHOTS } from '../lib/content-sources.mjs'

const REAL_DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../src/data')

let dataDir

afterEach(() => {
  if (dataDir) rmSync(dataDir, { recursive: true, force: true })
  dataDir = undefined
})

function copyRealSnapshots(dir) {
  for (const source of SNAPSHOTS) {
    for (const file of source.files) {
      copyFileSync(join(REAL_DATA_DIR, file), join(dir, file))
    }
  }
}

describe('verifyContent', () => {
  it('passes on the committed snapshots in src/data', () => {
    expect(verifyContent({ dataDir: REAL_DATA_DIR })).toEqual([])
  })

  it('fails when a snapshot file is missing', () => {
    dataDir = mkdtempSync(join(tmpdir(), 'content-verify-'))
    copyRealSnapshots(dataDir)
    unlinkSync(join(dataDir, 'garden-index.json'))

    const errors = verifyContent({ dataDir })
    expect(errors.some((e) => e.includes('garden-index.json') && e.includes('missing'))).toBe(true)
  })

  it('fails when a snapshot contains invalid JSON', () => {
    dataDir = mkdtempSync(join(tmpdir(), 'content-verify-'))
    copyRealSnapshots(dataDir)
    writeFileSync(join(dataDir, 'garden-notes.json'), '{ not valid json')

    const errors = verifyContent({ dataDir })
    expect(errors.some((e) => e.includes('garden-notes.json') && e.includes('invalid JSON'))).toBe(true)
  })

  it('fails on a placeholder empty-version ui-meta.json', () => {
    dataDir = mkdtempSync(join(tmpdir(), 'content-verify-'))
    copyRealSnapshots(dataDir)
    writeFileSync(join(dataDir, 'ui-meta.json'), JSON.stringify({ version: '', install: 'npm install @n3wth/ui' }))

    const errors = verifyContent({ dataDir })
    expect(errors.some((e) => e.includes('ui-meta.json.version'))).toBe(true)
  })

  it('fails on an empty-array garden-notes placeholder', () => {
    dataDir = mkdtempSync(join(tmpdir(), 'content-verify-'))
    copyRealSnapshots(dataDir)
    writeFileSync(join(dataDir, 'garden-notes.json'), '[]')

    const errors = verifyContent({ dataDir })
    expect(errors.some((e) => e.includes('garden-notes.json'))).toBe(true)
  })

  it('only reports validate errors for a source whose files all read cleanly', () => {
    dataDir = mkdtempSync(join(tmpdir(), 'content-verify-'))
    copyRealSnapshots(dataDir)
    // garden-search.json missing should not crash validation of garden-notes/ui-meta
    unlinkSync(join(dataDir, 'garden-search.json'))

    const errors = verifyContent({ dataDir })
    expect(errors.some((e) => e.includes('garden-search.json') && e.includes('missing'))).toBe(true)
    expect(errors.some((e) => e.includes('garden-notes.json'))).toBe(false)
    expect(errors.some((e) => e.includes('ui-meta.json'))).toBe(false)
  })
})
