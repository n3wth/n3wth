import { SiteFooter } from '@n3wth/ui/site'
import { FooterSignup } from './footer-signup'

export function Footer() {
  return <SiteFooter sourceHref="https://github.com/n3wth/n3wth/tree/main/apps/kit" signup={<FooterSignup />} />
}
