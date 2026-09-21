import { describe, it, expect } from 'vitest'
import {
  parseUiRegistry,
  validateGardenNotes,
  validateGardenIndex,
  validateGardenSearch,
  validateUiMeta,
  canonical,
  SOURCES,
} from '../lib/content-sources.mjs'

const REGISTRY_FIXTURE = JSON.stringify({ version: '2.1.0', name: '@n3wth/ui' })

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
    expect(SOURCES.map((s) => s.name).sort()).toEqual(['ui-meta'])
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
