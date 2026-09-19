import { SiteFooter, SiteSignup } from '@n3wth/ui/site'
import { siteConfig } from '../data/content'
import { trackOutbound, trackSignup } from '../lib/analytics'

export function Footer() {
  return <SiteFooter data-nosnippet signup={<SiteSignup onSubmit={trackSignup} />} links={<>
    <a href="https://docs.n3wth.com" onClick={() => trackOutbound('https://docs.n3wth.com', 'footer')}>Docs</a>
    <a href="/contact">Contact</a>
    <a href="/privacy">Privacy</a>
    <a href="/terms">Terms</a>
    <a href={siteConfig.social.github} onClick={() => trackOutbound(siteConfig.social.github, 'footer')}>GitHub</a>
    <a href={siteConfig.social.linkedin} onClick={() => trackOutbound(siteConfig.social.linkedin, 'footer')}>LinkedIn</a>
  </>} />
}
