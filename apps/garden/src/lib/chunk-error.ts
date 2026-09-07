/**
 * Recovery helpers for Next.js chunk-load failures.
 *
 * When the browser holds stale HTML after a redeploy (or after the dev server
 * re-hashes chunks on recompile), fetching a code-split chunk 404s and Next
 * throws a `ChunkLoadError`. The fix is almost always to reload and pull the
 * fresh asset manifest — but we guard against reload loops so a genuinely
 * missing chunk degrades to a retry UI instead of thrashing.
 */

const RELOAD_KEY = 'n3wth:chunk-reload-at'
const RELOAD_COOLDOWN_MS = 10_000

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false
  const err = error as { name?: string; message?: string }
  return (
    err.name === 'ChunkLoadError' ||
    /Loading chunk [^\s]+ failed/i.test(err.message ?? '') ||
    /ChunkLoadError/i.test(err.message ?? '')
  )
}

/**
 * If `error` is a chunk-load failure, trigger a one-time reload to fetch fresh
 * chunks. Returns `true` when a reload was kicked off (the caller can then hold
 * a "refreshing" state rather than showing the retry UI).
 *
 * A reload is suppressed if we already reloaded within the cooldown window,
 * which means the chunk is genuinely gone — let the retry UI take over.
 */
export function attemptChunkReload(error: unknown): boolean {
  if (typeof window === 'undefined' || !isChunkLoadError(error)) return false

  try {
    const lastReload = Number(window.sessionStorage.getItem(RELOAD_KEY) ?? 0)
    if (Date.now() - lastReload < RELOAD_COOLDOWN_MS) return false
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    // sessionStorage can be unavailable (private mode, blocked cookies). Reload
    // once without a loop guard rather than swallowing the recovery entirely.
  }

  window.location.reload()
  return true
}
