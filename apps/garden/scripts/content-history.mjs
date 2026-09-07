// Existing dates survive the snapshot import; later edits still update them.
export function mergeHistory(log, prefix, baseline) {
  const history = structuredClone(baseline)
  let timestamp = 0
  for (const line of log.split('\n')) {
    if (/^\d+$/.test(line)) { timestamp = Number(line) * 1000; continue }
    const [status, path] = line.split('\t')
    if (!path?.startsWith(prefix) || !path.endsWith('.md') || status === 'D') continue
    const key = path.slice(prefix.length)
    if (status === 'A' && baseline[key]) continue
    const entry = history[key] || { c: timestamp, m: timestamp }
    entry.c = Math.min(entry.c, timestamp)
    entry.m = Math.max(entry.m, timestamp)
    history[key] = entry
  }
  return history
}
