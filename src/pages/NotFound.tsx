import { Button } from '@astryxdesign/core/Button'
import { usePageMeta } from '../hooks/usePageMeta'

/* Unknown URLs used to silently render the homepage, which made bad
   links (and typos) indistinguishable from working ones. */
export default function NotFound() {
  usePageMeta('Not found — Oliver Newth', 'This page does not exist.')

  return (
    <section aria-label="Page not found" className="min-h-[70vh] flex items-center">
      <div className="section-pad pad-air w-full">
        <p className="label mb-5" style={{ color: 'var(--ink-dim)' }}>
          404
        </p>
        <h1
          className="display text-[clamp(2.5rem,7vw,5.5rem)] max-w-[18ch]"
          style={{ letterSpacing: '-0.03em', lineHeight: 1 }}
        >
          This page doesn&rsquo;t exist
        </h1>
        <p className="mt-6 t-lead max-w-lg" style={{ color: 'var(--ink-dim)' }}>
          The link may be old, or the address mistyped.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button label="Go home" variant="primary" href="/" />
          <Button label="View work" variant="ghost" href="/work" />
        </div>
      </div>
    </section>
  )
}
