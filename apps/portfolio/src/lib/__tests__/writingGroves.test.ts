import { describe, expect, it } from 'vitest'
import { layoutWritingGroves, plantSegments, type WritingNode } from '../writingGroves'

const nodes: WritingNode[] = Array.from({ length: 280 }, (_, i) => ({
  id: `/thinking/nested/note-${i}`,
  title: `Note ${i}`,
  description: '',
  stage: i % 2 ? 'evergreen' : 'seedling',
  tags: [`topic-${i % 12}`],
  linkCount: i % 20,
}))

describe('homepage writing groves', () => {
  it('keeps all writing and produces the same placement independent of source order', () => {
    const first = layoutWritingGroves(nodes, false)
    expect(first).toEqual(layoutWritingGroves([...nodes].reverse(), false))
    expect(new Set(first.map((tree) => tree.id)).size).toBe(nodes.length)
  })

  it('leaves the central navigation corridor and near landmarks clear in both layouts', () => {
    for (const compact of [false, true]) {
      for (const tree of layoutWritingGroves(nodes, compact)) {
        expect(Math.abs(tree.x)).toBeGreaterThan(4)
        expect(tree.z).toBeLessThan(-5)
        expect(tree.z).toBeGreaterThan(-47)
      }
    }
  })

  it('retains maturity, repeatable silhouettes and bounded geometry per tree', () => {
    for (const tree of layoutWritingGroves(nodes, false)) {
      const segments = plantSegments(tree)
      expect(segments).toEqual(plantSegments(tree))
      expect(segments.length).toBeLessThanOrEqual(15)
      expect(segments[0].a[1]).toBe(0)
      expect(segments[2].b[1]).toBe(tree.height)
      expect(tree.height).toBe(tree.stage === 'seedling' ? 1 : 4.2)
      expect(segments.flatMap((segment) => [...segment.a, ...segment.b]).every(Number.isFinite)).toBe(true)
    }
  })

  it('handles an empty collection and writing without topics', () => {
    expect(layoutWritingGroves([], false)).toEqual([])
    expect(layoutWritingGroves([{ ...nodes[0], tags: [] }], true)).toHaveLength(1)
  })
})
