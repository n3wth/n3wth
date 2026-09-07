import { describe, it, expect } from 'vitest'
import { scoreItem, searchItems } from '../search'
import type { SearchItem } from '../search'

const item = (over: Partial<SearchItem> & { id: string; title: string }): SearchItem => ({
  href: `/${over.id}`,
  group: 'Pages',
  ...over,
})

const items: SearchItem[] = [
  item({ id: 'beat', title: 'Beat', subtitle: 'The layout unit every piece is built from', group: 'Library' }),
  item({ id: 'work', title: 'Work', subtitle: 'A decade of AI in production' }),
  item({ id: 'zettelkasten', title: 'Zettelkasten Method', subtitle: 'Connected atomic notes', group: 'Garden' }),
  item({ id: 'flow', title: 'FlowDiagram', subtitle: 'Labelled nodes, curved edges', group: 'Library' }),
  item({ id: 'night', title: 'What the night field broke', subtitle: 'A build log', group: 'Thinking' }),
]

describe('scoreItem', () => {
  it('returns 0 when nothing matches', () => {
    expect(scoreItem(items[0], 'xylophone')).toBe(0)
  })

  it('is case insensitive', () => {
    expect(scoreItem(items[0], 'BEAT')).toBeGreaterThan(0)
    expect(scoreItem(items[0], 'beat')).toBeGreaterThan(0)
  })

  it('ranks an exact title match above a plain substring match', () => {
    const exact = scoreItem(item({ id: 'a', title: 'flow' }), 'flow')
    const substring = scoreItem(item({ id: 'b', title: 'overflowing' }), 'flow')
    expect(exact).toBeGreaterThan(substring)
  })

  it('ranks a title prefix above a mid-word title match', () => {
    const prefix = scoreItem(item({ id: 'a', title: 'Flowchart' }), 'flow')
    const mid = scoreItem(item({ id: 'b', title: 'Overflow' }), 'flow')
    expect(prefix).toBeGreaterThan(mid)
  })

  it('ranks a title match above a subtitle-only match', () => {
    const inTitle = scoreItem(item({ id: 'a', title: 'Notes' }), 'notes')
    const inSubtitle = scoreItem(item({ id: 'b', title: 'Garden', subtitle: 'Connected notes' }), 'notes')
    expect(inTitle).toBeGreaterThan(inSubtitle)
  })

  it('matches on the subtitle when the title does not match', () => {
    expect(scoreItem(items[1], 'production')).toBeGreaterThan(0)
  })
})

describe('searchItems', () => {
  it('returns nothing for an empty query', () => {
    expect(searchItems(items, '')).toEqual([])
    expect(searchItems(items, '   ')).toEqual([])
  })

  it('filters out non-matches', () => {
    const found = searchItems(items, 'zettel')
    expect(found).toHaveLength(1)
    expect(found[0].title).toBe('Zettelkasten Method')
  })

  it('respects the limit', () => {
    const found = searchItems(items, 'e', 2)
    expect(found.length).toBeLessThanOrEqual(2)
  })

  it('is stable: the same query returns the same order twice', () => {
    const a = searchItems(items, 'e').map((r) => r.id)
    const b = searchItems(items, 'e').map((r) => r.id)
    expect(a).toEqual(b)
  })

  it('puts the strongest match first', () => {
    const found = searchItems(items, 'beat')
    expect(found[0].id).toBe('beat')
  })

  it('searches across groups at once', () => {
    const groups = new Set(searchItems(items, 'a').map((r) => r.group))
    expect(groups.size).toBeGreaterThan(1)
  })
})
