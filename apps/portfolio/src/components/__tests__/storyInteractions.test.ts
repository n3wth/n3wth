import { describe, expect, it } from 'vitest'
import { segmentContact } from '../storyInteractions'

describe('hero line contacts', () => {
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
