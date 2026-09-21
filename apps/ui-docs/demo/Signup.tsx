import posthog from 'posthog-js'
import { captureNewsletterSubscribed } from '@n3wth/site-config/analytics'
import { SiteSignup } from '@n3wth/ui/site'

export function Signup() {
  return <SiteSignup onSubmit={() => captureNewsletterSubscribed(posthog, 'ui')} />
}
