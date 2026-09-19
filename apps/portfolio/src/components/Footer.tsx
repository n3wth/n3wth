import { SiteFooter, SiteSignup } from '@n3wth/ui/site'
import { siteConfig } from '../data/content'
import { trackSignup } from '../lib/analytics'

export function Footer() {
  return <SiteFooter data-nosnippet signup={<SiteSignup onSubmit={trackSignup} />} links={<>
    <a href="https://docs.n3wth.com">Docs</a>
    <a href="/contact">Contact</a>
    <a href="/privacy">Privacy</a>
    <a href="/terms">Terms</a>
    <a href={siteConfig.social.github}>GitHub</a>
    <a href={siteConfig.social.linkedin}>LinkedIn</a>
  </>} />
}
