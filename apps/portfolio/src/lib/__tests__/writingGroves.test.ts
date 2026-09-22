import { describe, expect, it } from 'vitest'
import { PerspectiveCamera, Vector3 } from 'three'
import { layoutWritingGroves, plantSegments, type WritingNode } from '../writingGroves'

const nodes: WritingNode[] = Array.from({ length: 280 }, (_, i) => ({
  id: `/thinking/nested/note-${i}`,
  title: `Note ${i}`,
  description: '',
  stage: i % 2 ? 'evergreen' : 'seedling',
  tags: [['articles', 'books', 'health', 'career', 'learning', 'product', 'gardening', 'other'][i % 8]],
  linkCount: i % 20,
}))

describe('homepage writing groves', () => {
  it('keeps all writing and produces the same placement independent of source order', () => {
    const first = layoutWritingGroves(nodes, false)
    expect(first).toEqual(layoutWritingGroves([...nodes].reverse(), false))
    expect(new Set(first.map((tree) => tree.id)).size).toBe(nodes.length)
  })

  it('keeps trees behind the near landmarks and separates topic clearings', () => {
    for (const compact of [false, true]) {
      for (const tree of layoutWritingGroves(nodes, compact)) {
        expect(tree.z).toBeLessThan(-5)
        expect(tree.z).toBeGreaterThan(-140)
      }
    }
    const trees = layoutWritingGroves(nodes, false)
    expect(new Set(trees.map((tree) => tree.grove)).size).toBe(8)
  })

  it('keeps trees on visible ground, outside landmark footprints, with selectable trees in view', () => {
    for (const aspect of [390 / 844, 852 / 900, 1440 / 900, 2]) {
      const compact = aspect < 1.35
      const spread = compact ? Math.max(1, Math.min(1.35, aspect) / 0.5) : 1
      const fov = Math.max(compact ? 54 : 48, 2 * Math.atan((compact ? 0.25 : 0.68) / aspect) * 180 / Math.PI)
      const camera = new PerspectiveCamera(fov, aspect, 0.1, 1000)
      camera.position.set(0, compact ? 14 : 3.2, compact ? 26 : 22 + Math.max(0, 1.8 - aspect) * 14)
      camera.lookAt(0, compact ? 1 : 4.5, -30)
      camera.updateMatrixWorld()
      const landmarks = [
        { x: compact ? -4.2 * spread : -6, z: compact ? -13 : -16, width: compact ? 5.6 : 4.5, height: 5, depth: 4 },
        { x: compact ? 3.2 * spread : 27, z: compact ? -35 : -46, width: 10.5, height: 8, depth: 7 },
        { x: compact ? -14 * spread : -52, z: compact ? -85 : -100, width: 13, height: 24, depth: 13 },
      ]
      let visible = 0
      for (const tree of layoutWritingGroves(nodes, compact, spread)) {
        const base = new Vector3(tree.x, 0, tree.z).project(camera)
        const tip = new Vector3(tree.x, tree.height, tree.z).project(camera)
        if (Math.abs(base.x) < 1 && Math.abs(base.y) < 1 && tip.y - base.y > 0.01) visible++
        for (const landmark of landmarks) {
          expect(Math.abs(tree.x - landmark.x) > landmark.width || Math.abs(tree.z - landmark.z) > landmark.depth).toBe(true)
        }
      }
      expect(visible).toBeGreaterThan(35)
    }
  })

  it('retains maturity, repeatable silhouettes and bounded geometry per tree', () => {
    for (const tree of layoutWritingGroves(nodes, false)) {
      const segments = plantSegments(tree)
      expect(segments).toEqual(plantSegments(tree))
      expect(segments.length).toBeLessThanOrEqual(15)
      expect(segments[0].a[1]).toBe(0)
      expect(segments[2].b[1]).toBe(tree.height)
      const base = tree.stage === 'seedling' ? 0.65 : 2.7
      expect(tree.height).toBeGreaterThanOrEqual(base * 0.8)
      expect(tree.height).toBeLessThanOrEqual(base * 1.2)
      expect(segments.flatMap((segment) => [...segment.a, ...segment.b]).every(Number.isFinite)).toBe(true)
    }
  })

  it('handles an empty collection and writing without topics', () => {
    expect(layoutWritingGroves([], false)).toEqual([])
    expect(layoutWritingGroves([{ ...nodes[0], tags: [] }], true)).toHaveLength(1)
  })
})
