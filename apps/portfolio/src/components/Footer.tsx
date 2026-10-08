import { useState } from 'react'
import { Link } from 'react-router-dom'
import { submitNewsletter, newsletterErrorMessage } from '@n3wth/site-config/newsletter'
import { SiteFooter, SiteSignup } from '@n3wth/ui/site'
import { navigation, siteConfig } from '../data/content'
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
  return <SiteFooter brand={null} inlineSignup separator={false} data-nosnippet signup={<SiteSignup compact onSubmit={subscribe} errorMessage={errorMessage} />} links={<>
      {navigation.map(section => <Link key={section.href} to={section.href}>{section.name}</Link>)}
      <Link to="/privacy">Privacy</Link>
      <Link to="/terms">Terms</Link>
      <a href={siteConfig.social.github} onClick={() => trackOutbound(siteConfig.social.github, 'footer')}>GitHub</a>
  </>} />
}
