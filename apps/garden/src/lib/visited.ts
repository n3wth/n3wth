// The explored trail: which notes this reader has opened, kept privately
// in localStorage. The 3D garden marks visited notes and counts progress;
// note pages record the visit.

const KEY = 'garden:visited'
const MAX_ENTRIES = 1000

export function getVisited(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function recordVisit(slug: string): void {
  if (typeof window === 'undefined') return
  try {
    const visited = getVisited()
    visited[slug] = Date.now()
    const entries = Object.entries(visited)
    if (entries.length > MAX_ENTRIES) {
      entries.sort((a, b) => b[1] - a[1])
      window.localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(entries.slice(0, MAX_ENTRIES))))
    } else {
      window.localStorage.setItem(KEY, JSON.stringify(visited))
    }
  } catch {
    // storage full or blocked — the trail is a nicety, never an error
  }
}
