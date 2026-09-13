import { describe, expect, it } from 'vitest'
import { registeredPieces } from '../registry'

/* Every /thinking/:slug route ships its own document title and meta
   description (via usePageMeta and scripts/prerender-meta.mjs). A piece
   registered without a title or dek, or two pieces sharing one, would
   collapse those routes to duplicate or empty meta — assert uniqueness
   here so it fails before the prerendered HTML ships. */
describe('thinking piece metadata', () => {
  it('registers at least one piece', () => {
    expect(registeredPieces.length).toBeGreaterThan(0)
  })

  it('gives every piece a unique route slug', () => {
    const ids = registeredPieces.map((p) => p.meta.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('gives every piece a non-empty title and description', () => {
    for (const { meta } of registeredPieces) {
      expect(meta.title.trim(), `${meta.id} title`).not.toBe('')
      expect(meta.dek.trim(), `${meta.id} dek`).not.toBe('')
      expect(meta.date, `${meta.id} date`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('produces a unique document title per piece route', () => {
    const titles = registeredPieces.map((p) => `${p.meta.title} — Oliver Newth`)
    expect(new Set(titles).size).toBe(titles.length)
    // The index route title must not collide with any piece title either.
    expect(titles).not.toContain('Thinking — Oliver Newth')
  })

  it('produces a unique meta description per piece route', () => {
    const deks = registeredPieces.map((p) => p.meta.dek.trim())
    expect(new Set(deks).size).toBe(deks.length)
  })
})
