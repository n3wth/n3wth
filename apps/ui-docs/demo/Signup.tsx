import posthog from 'posthog-js'
import { captureEmailSignup } from '@n3wth/site-config/analytics'
import { SiteSignup } from '@n3wth/ui/site'

export function Signup() {
  return <SiteSignup onSubmit={email => captureEmailSignup(posthog, email)} />
}
