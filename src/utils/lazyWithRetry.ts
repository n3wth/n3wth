import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

const CHUNK_ERROR_PATTERNS = [
  /ChunkLoadError/i,
  /Loading chunk [\d]+ failed/i,
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
]

function isChunkError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message))
}

interface LazyRetryOptions {
  retries?: number
  retryDelayMs?: number
}

export function lazyWithRetry<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
  options: LazyRetryOptions = {}
): LazyExoticComponent<T> {
  const { retries = 1, retryDelayMs = 1200 } = options
  let attempt = 0

  return lazy(() => {
    const load = (): Promise<{ default: T }> =>
      importer().catch((error) => {
        if (!isChunkError(error) || attempt >= retries) {
          throw error
        }

        attempt += 1
        return new Promise((resolve) => setTimeout(resolve, retryDelayMs)).then(load)
      })

    return load()
  })
}
