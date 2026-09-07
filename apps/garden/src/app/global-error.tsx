'use client'

import { useEffect, useState } from 'react'
import { attemptChunkReload, isChunkLoadError } from '@/lib/chunk-error'
import './globals.css'

// global-error replaces the root layout entirely, so it renders its own
// <html>/<body> and leans on hardcoded palette values rather than the theme
// provider (which may be the very thing that failed to mount).
export default function GlobalError({
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

  const chunkError = isChunkLoadError(error)

  return (
    <html lang="en" data-theme="dark" data-astryx-theme="n3wth">
      <body
        style={{
          minHeight: '100vh',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#08090b',
          color: '#f2f3f5',
          fontFamily: '"Geist Sans", system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: '32rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
            {reloading ? 'Fetching a fresh copy…' : 'The garden hit a snag'}
          </h1>
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#9aa0a8' }}>
            {reloading
              ? 'Part of the page failed to load. Reloading to pull the latest version.'
              : chunkError
                ? 'Part of the page failed to load — usually a stale tab after an update. A refresh should sort it.'
                : 'Something unexpected interrupted the page. Try again, or head back to the garden.'}
          </p>
          {!reloading && (
            <div
              style={{
                marginTop: '1.5rem',
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => (chunkError ? window.location.reload() : reset())}
                style={buttonStyle}
              >
                {chunkError ? 'Refresh' : 'Try again'}
              </button>
              <a href="/" style={buttonStyle}>
                Back to the garden
              </a>
            </div>
          )}
        </div>
      </body>
    </html>
  )
}

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  borderRadius: '0.5rem',
  padding: '0.5rem 1rem',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  textDecoration: 'none',
  cursor: 'pointer',
  background: '#0d0e10',
  border: '1px solid rgba(255, 255, 255, 0.09)',
  color: '#9aa0a8',
}
