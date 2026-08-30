import { Button } from '@astryxdesign/core/Button'
import { usePageMeta } from '../hooks/usePageMeta'

/* Post-logout landing page — listed in Auth0's Allowed Logout URLs so
   sign-outs without a client_id have somewhere calm to land. */
export default function Logout() {
  usePageMeta('Signed out — Oliver Newth', 'You have been signed out.', { noindex: true })

  return (
    <section aria-label="Signed out" className="relative min-h-[70vh] flex items-center">
      <div className="frame relative w-full">
        <div className="section-pad pad-air w-full">
          <p className="label mb-5" style={{ color: 'var(--ink-dim)' }}>
            Signed out
          </p>
          <h1
            className="display text-[clamp(2.5rem,7vw,5.5rem)] max-w-[18ch]"
            style={{ letterSpacing: '-0.03em', lineHeight: 1 }}
          >
            You&rsquo;re signed out
          </h1>
          <p className="mt-6 t-lead max-w-lg" style={{ color: 'var(--ink-dim)' }}>
            Your session has ended. Close this tab, or head back in.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button label="Go home" variant="primary" href="/" />
            <Button label="Get support" variant="ghost" href="https://support.n3wth.com" />
          </div>
        </div>
      </div>
    </section>
  )
}
