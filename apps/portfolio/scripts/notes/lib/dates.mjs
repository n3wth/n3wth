// Reviewed frontmatter and migration history are the only freshness sources.
export function feedDate(value) {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) throw new Error(`Invalid article date: ${value}`)
  return date.toISOString()
}

export function noteDates(note, history = {}) {
  const day = (value, label) => {
    if (!value) return undefined
    const parsed = new Date(value)
    if (!Number.isFinite(parsed.getTime())) throw new Error(`Invalid ${label} date: ${value}`)
    return parsed.toISOString().slice(0, 10)
  }
  const date = day(note.date || history.c, 'publication')
  const updated = [date, day(note.updated, 'updated'), day(history.m, 'history')].filter(Boolean).sort().at(-1)
  return { ...(date ? { date } : {}), ...(updated ? { updated } : {}) }
}
