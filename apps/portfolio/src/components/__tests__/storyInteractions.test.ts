import { describe, expect, it } from 'vitest'
import { crossing, segmentContact } from '../storyInteractions'

describe('hero line contacts', () => {
  it('locates a shared origin on both intersecting segments', () => {
    expect(crossing({ x: 0, y: 5 }, { x: 20, y: 5 }, { x: 5, y: 0 }, { x: 5, y: 20 }))
      .toEqual({ first: .25, second: .25, x: 5, y: 5 })
  })

  it('does not seed bursts on parallel overlaps or nearby disconnected lines', () => {
    expect(crossing({ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 5, y: 0 }, { x: 10, y: 0 })).toBeNull()
    expect(crossing({ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 10 })).toBeNull()
  })

  it('finds a crossing even when the pulse moves past it between frames', () => {
    expect(segmentContact({ x: -20, y: 5 }, { x: 20, y: 5 }, { x: 0, y: 0 }, { x: 0, y: 10 })).toBe(.5)
  })

  it('starts the new pulse at the shared endpoint', () => {
    expect(segmentContact({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 10 })).toBe(0)
  })

  it('allows a near touch within the visible stroke width', () => {
    expect(segmentContact({ x: 5, y: -4 }, { x: 5, y: -1 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(.5)
  })

  it('does not connect separated parallel lines', () => {
    expect(segmentContact({ x: 0, y: 3 }, { x: 10, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBeNull()
  })

  it('does not extrapolate past the receiving line', () => {
    expect(segmentContact({ x: 15, y: -5 }, { x: 15, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBeNull()
  })

  it('handles a zero-length target without invalid coordinates', () => {
    expect(segmentContact({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0)
  })
})
