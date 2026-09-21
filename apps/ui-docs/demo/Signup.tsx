import posthog from 'posthog-js'
import { useState } from 'react'
import { submitNewsletter, newsletterErrorMessage } from '@n3wth/site-config/newsletter'
import { captureNewsletterSubscribed } from '@n3wth/site-config/analytics'
import { SiteSignup } from '@n3wth/ui/site'

export function Signup() {
  const [errorMessage, setErrorMessage] = useState<string>()
  async function subscribe(address: string) {
    try {
      await submitNewsletter(address, 'ui', { endpoint: import.meta.env.VITE_SUBSCRIBE_ENDPOINT })
    } catch (error) {
      setErrorMessage(newsletterErrorMessage(error))
      throw error
    }
    captureNewsletterSubscribed(posthog, 'ui')
  }
  return <SiteSignup onSubmit={subscribe} errorMessage={errorMessage} />
}
