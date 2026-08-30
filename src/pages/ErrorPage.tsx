import { useSearchParams } from 'react-router-dom'
import { Button } from '@astryxdesign/core/Button'
import { usePageMeta } from '../hooks/usePageMeta'

/* Landing page for error redirects from auth providers (Auth0 sends
   ?error=...&error_description=... when a login can't complete). Raw
   provider strings are shown verbatim in a mono block, never as the
   headline — they're machine output, not copy. */

const HEADLINES: Record<string, string> = {
  access_denied: 'Sign-in was cancelled or refused',
  unauthorized: 'This account isn’t allowed in',
  login_required: 'You need to sign in again',
  consent_required: 'Sign-in needs your consent to continue',
  invalid_request: 'The sign-in request was malformed',
  server_error: 'The sign-in service hit a problem',
  temporarily_unavailable: 'The sign-in service is briefly down',
}

export default function ErrorPage() {
  usePageMeta('Something went wrong — Oliver Newth', 'An error occurred.', { noindex: true })

  const [params] = useSearchParams()
  const code = params.get('error') ?? params.get('code') ?? ''
  const description = params.get('error_description') ?? params.get('message') ?? ''
  const headline = HEADLINES[code] ?? 'Something went wrong'

  return (
    <section aria-label="Error" className="relative min-h-[70vh] flex items-center">
      <div className="frame relative w-full">
        <div className="section-pad pad-air w-full">
          <h1
            className="display text-[clamp(2.5rem,7vw,5.5rem)] max-w-[18ch]"
            style={{ letterSpacing: '-0.03em', lineHeight: 1 }}
          >
            {headline}
          </h1>
          <p className="mt-6 t-lead max-w-lg" style={{ color: 'var(--ink-dim)' }}>
            Trying again usually clears it. If it keeps happening, email{' '}
            <a href="mailto:support@n3wth.com" className="underline underline-offset-4">
              support@n3wth.com
            </a>{' '}
            with the details below.
          </p>
          {(code || description) && (
            <div
              className="mt-8 max-w-lg border p-4 font-mono text-sm"
              style={{ borderColor: 'var(--rail, rgba(242,243,245,0.15))', color: 'var(--ink-dim)' }}
            >
              {code && <p>error: {code}</p>}
              {description && <p className="mt-1">{description}</p>}
            </div>
          )}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button label="Try again" variant="primary" clickAction={() => history.back()} />
            <Button label="Go home" variant="ghost" href="/" />
          </div>
        </div>
      </div>
    </section>
  )
}
