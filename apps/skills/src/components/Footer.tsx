'use client'

import { SiteFooter } from '@n3wth/ui/site'
import { siteConfig } from '../config/site'

export function Footer() {
  return <SiteFooter sourceHref={siteConfig.links.github} legalLinks={<><a href="/terms">Terms</a><a href="/privacy">Privacy</a></>} />
}
