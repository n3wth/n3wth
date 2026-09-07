/**
 * The matcher behind site search. Deliberately tiny and dependency-free:
 * a fuzzy-search library would be more forgiving about typos, but it would
 * also reorder results in ways that are hard to explain, and the corpus here
 * is a few hundred short titles rather than a document store.
 *
 * Pure and synchronous by design, so it can be tested without a DOM
 * (src/lib/__tests__/search.test.ts).
 */

export type ResultGroup = 'Pages' | 'Thinking' | 'Library' | 'Garden' | 'Elsewhere'

export interface SearchItem {
  id: string
  title: string
  subtitle?: string
  href: string
  external?: boolean
  group: ResultGroup
}

/**
 * The order groups fall back to when two results score identically. It is
 * closeness-to-here order: this site's own routes first, then its writing,
 * then things you'd install, then the notes, then the other properties.
 */
export const GROUP_ORDER: readonly ResultGroup[] = [
  'Pages',
  'Thinking',
  'Library',
  'Garden',
  'Elsewhere',
]

const GROUP_RANK: Record<ResultGroup, number> = {
  Pages: 0,
  Thinking: 1,
  Library: 2,
  Garden: 3,
  Elsewhere: 4,
}

/* Bands, not a continuous scale: a title match of any kind always outranks
   a subtitle match, and the gaps are wide enough that adding a tie-breaker
   later can't accidentally cross a band. */
const EXACT_TITLE = 100
const TITLE_PREFIX = 80
const TITLE_WORD_PREFIX = 60
const TITLE_SUBSTRING = 40
const SUBTITLE_SUBSTRING = 20

/** Letters and digits in any script; everything else starts a new word. */
const WORD_CHAR = /[\p{L}\p{N}]/u

/**
 * True when `needle` starts one of `haystack`'s words other than the first.
 * "diagram" hits inside "FlowDiagram" once the camel case is lowercased and
 * the space is gone, so this is deliberately about separators only: the
 * first-word case is already scored higher by the caller.
 */
function startsAWord(haystack: string, needle: string): boolean {
  let at = haystack.indexOf(needle)
  while (at > 0) {
    if (!WORD_CHAR.test(haystack.charAt(at - 1))) return true
    at = haystack.indexOf(needle, at + 1)
  }
  return false
}

/**
 * How well one item answers a query. 0 means no match at all, which is the
 * caller's signal to drop the item rather than render it faintly.
 */
export function scoreItem(item: SearchItem, query: string): number {
  const q = query.trim().toLowerCase()
  if (q.length === 0) return 0

  const title = item.title.toLowerCase()
  if (title === q) return EXACT_TITLE
  if (title.startsWith(q)) return TITLE_PREFIX
  if (startsAWord(title, q)) return TITLE_WORD_PREFIX
  if (title.includes(q)) return TITLE_SUBSTRING

  const subtitle = item.subtitle?.toLowerCase()
  if (subtitle !== undefined && subtitle.includes(q)) return SUBTITLE_SUBSTRING

  return 0
}

interface Scored {
  item: SearchItem
  score: number
}

/* Total order, so two renders of the same query can never disagree: score,
   then group, then title, then href, then id. Array.prototype.sort is stable
   in every engine that ships React 19, but relying on input order would make
   the palette jitter as soon as the garden notes arrive and change it. */
function byRank(a: Scored, b: Scored): number {
  if (a.score !== b.score) return b.score - a.score
  const group = GROUP_RANK[a.item.group] - GROUP_RANK[b.item.group]
  if (group !== 0) return group
  const title = a.item.title.localeCompare(b.item.title)
  if (title !== 0) return title
  const href = a.item.href.localeCompare(b.item.href)
  if (href !== 0) return href
  return a.item.id.localeCompare(b.item.id)
}

/**
 * Every item that matches, best first. An empty or whitespace-only query
 * returns nothing at all; showing a "start here" set instead is the caller's
 * job, not the matcher's. `limit` is uncapped by default so callers can count
 * the true number of matches and decide for themselves how many to draw.
 */
export function searchItems(
  items: SearchItem[],
  query: string,
  limit: number = Number.POSITIVE_INFINITY
): SearchItem[] {
  const q = query.trim()
  if (q.length === 0) return []

  const scored: Scored[] = []
  for (const item of items) {
    const score = scoreItem(item, q)
    if (score > 0) scored.push({ item, score })
  }
  scored.sort(byRank)

  const kept = limit < scored.length ? scored.slice(0, limit) : scored
  return kept.map((entry) => entry.item)
}
