'use client'

import { useEffect, useState } from 'react'
import { Link } from 'next-view-transitions'
import { attemptChunkReload, isChunkLoadError } from '@/lib/chunk-error'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [reloading, setReloading] = useState(false)

  useEffect(() => {
    if (attemptChunkReload(error)) setReloading(true)
  }, [error])

  // A chunk failure we've already tried reloading for: offer a hard refresh
  // rather than reset(), which just re-renders against the same stale manifest.
  const chunkError = isChunkLoadError(error)

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/seedling.webp"
        alt=""
        aria-hidden
        width={140}
        height={140}
        className="mb-2 opacity-80"
        style={{ mixBlendMode: 'screen' }}
      />
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text-primary)]">
        {reloading ? 'Fetching a fresh copy…' : 'This page hit a snag'}
      </h1>
      <p className="mt-2 max-w-md text-sm text-[var(--color-text-secondary)]">
        {reloading
          ? 'Part of the page failed to load. Reloading to pull the latest version.'
          : chunkError
            ? 'Part of the page failed to load — usually a stale tab after an update. A refresh should sort it.'
            : 'Something unexpected interrupted this page. Try again, or head back to the garden.'}
      </p>
      {!reloading && (
        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => (chunkError ? window.location.reload() : reset())}
            className="rounded-lg px-4 py-2 text-xs uppercase tracking-wide transition-colors"
            style={{
              background: 'var(--color-background-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {chunkError ? 'Refresh' : 'Try again'}
          </button>
          <Link
            href="/"
            className="rounded-lg px-4 py-2 text-xs uppercase tracking-wide transition-colors"
            style={{
              background: 'var(--color-background-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Back to the garden
          </Link>
        </div>
      )}
    </div>
  )
}
