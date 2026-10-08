import { useState } from 'react'
import { withTheme } from './withTheme'
import { submitNewsletter, newsletterErrorMessage } from '@n3wth/site-config/newsletter'
import { SiteFooter, SiteSignup } from '@n3wth/ui/site'
import { navigation, siteConfig } from '../data/content'
import { trackOutbound, trackSignup } from '../lib/analytics'
import { useHydrated } from '../lib/navigation'

export function Footer() {
  const ready = useHydrated()
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
  return <SiteFooter brand={null} inlineSignup separator={false} data-nosnippet signup={<SiteSignup compact disabled={!ready} onSubmit={subscribe} errorMessage={errorMessage} />} links={<>
      {navigation.map(section => <a key={section.href} href={section.href}>{section.name}</a>)}
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
      <a href="/support">Support</a>
      <a href="/consent">SMS consent</a>
      <a href={siteConfig.social.github} onClick={() => trackOutbound(siteConfig.social.github, 'footer')}>GitHub</a>
  </>} />
}

export default withTheme(Footer)
