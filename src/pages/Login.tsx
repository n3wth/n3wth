import { useEffect } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'

/* Auth0 tenant login URI. When Auth0 needs to restart a login it redirects
   here with the query params required to resume; we forward them verbatim
   to the tenant's /authorize endpoint (auth.n3wth.com is the Auth0 custom
   domain). A direct visit with no params can't authorize — send it home. */
export default function Login() {
  usePageMeta('Signing in — Oliver Newth', 'Redirecting to sign-in.', { noindex: true })

  useEffect(() => {
    const search = window.location.search
    window.location.replace(
      search.length > 1 ? `https://auth.n3wth.com/authorize${search}` : '/',
    )
  }, [])

  return (
    <section aria-label="Redirecting" className="relative min-h-[70vh] flex items-center">
      <div className="frame relative w-full">
        <div className="section-pad pad-air w-full">
          <p className="label" style={{ color: 'var(--ink-dim)' }}>
            Redirecting to sign-in…
          </p>
        </div>
      </div>
    </section>
  )
}
