import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '@n3wth/ui/primitives'
import { usePageMeta } from '../hooks/usePageMeta'
import { track } from '../lib/analytics'

/* Unknown URLs used to silently render the homepage, which made bad
   links (and typos) indistinguishable from working ones. */
export default function NotFound() {
  const location = useLocation()
  const viewedLocationKey = useRef<string | null>(null)

  usePageMeta('Not found — Oliver Newth', 'This page does not exist.', { noindex: true })

  useEffect(() => {
    if (viewedLocationKey.current === location.key) return
    viewedLocationKey.current = location.key
    track('not_found_viewed', { source_page: '/404' })
  }, [location.key])

  const trackRecovery = (destination: 'home' | 'work' | 'contact') => {
    track('not_found_recovery_clicked', { source_page: '/404', destination })
  }

  return (
    <section
      aria-label="Page not found"
      className="bleed relative min-h-[70vh] flex items-center overflow-hidden"
    >
      {/* An empty playa — nothing stands here. Edges fade into the page. */}
      <div aria-hidden className="absolute inset-0">
        <img
          src="/images/empty-playa.webp"
          alt=""
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(8,9,11,0.85), rgba(8,9,11,0.3) 55%, rgba(8,9,11,0.1)), linear-gradient(to bottom, var(--bg), transparent 20%, transparent 80%, var(--bg))',
          }}
        />
      </div>
      <div className="frame relative w-full">
      <div className="section-pad pad-air w-full">
        <h1
          className="display page-title max-w-[18ch]"
          style={{ letterSpacing: '-0.03em', lineHeight: 1 }}
        >
          This page doesn&rsquo;t exist
        </h1>
        <p className="mt-6 t-lead max-w-lg" style={{ color: 'var(--ink-dim)' }}>
          The link may be old, or the address mistyped (404).
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button label="Go home" variant="primary" href="/" clickAction={() => trackRecovery('home')} />
          <Button label="View work" variant="ghost" href="/work" clickAction={() => trackRecovery('work')} />
          <Button label="Contact" variant="ghost" href="/contact" clickAction={() => trackRecovery('contact')} />
        </div>
      </div>
      </div>
    </section>
  )
}
