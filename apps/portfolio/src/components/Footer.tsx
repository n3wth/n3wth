import { useState } from 'react'
import { submitNewsletter, newsletterErrorMessage } from '@n3wth/site-config/newsletter'
import { SiteFooter, SiteSignup } from '@n3wth/ui/site'
import { siteConfig } from '../data/content'
import { trackOutbound, trackSignup } from '../lib/analytics'

export function Footer() {
  const [errorMessage, setErrorMessage] = useState<string>()
  async function subscribe(address: string) {
    try {
      await submitNewsletter(address, 'home', { endpoint: import.meta.env.VITE_SUBSCRIBE_ENDPOINT })
    } catch (error) {
      setErrorMessage(newsletterErrorMessage(error))
      throw error
    }
    trackSignup()
  }
  return <SiteFooter brand={null} inlineSignup data-nosnippet signup={<SiteSignup compact onSubmit={subscribe} errorMessage={errorMessage} />} links={<>
    <a href="/contact">Contact</a>
    <a href="/privacy">Privacy</a>
    <a href="/terms">Terms</a>
    <a href={siteConfig.social.github} onClick={() => trackOutbound(siteConfig.social.github, 'footer')}>GitHub</a>
  </>} />
}
