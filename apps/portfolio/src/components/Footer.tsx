import { SiteFooter } from '@n3wth/ui/site'
import { siteConfig } from '../data/content'

export function Footer() {
  return <SiteFooter data-nosnippet links={<>
    <a href="/contact">Contact</a>
    <a href={siteConfig.social.github}>GitHub</a>
    <a href={siteConfig.social.linkedin}>LinkedIn</a>
  </>} />
}
