import { useEffect } from 'react'
import { SiteContainer, SiteSection, SiteText } from '@n3wth/ui/site'
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
    <SiteContainer as="section" aria-label="Redirecting">
      <SiteSection><SiteText role="status" aria-live="polite">Redirecting to sign-in…</SiteText></SiteSection>
    </SiteContainer>
  )
}
