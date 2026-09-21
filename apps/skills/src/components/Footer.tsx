'use client'

import posthog from 'posthog-js'
import { captureNewsletterSubscribed } from '@n3wth/site-config/analytics'
import { SiteFooter, SiteSignup } from '@n3wth/ui/site'
import { siteConfig } from '../config/site'

export function Footer() {
  return <SiteFooter sourceHref={siteConfig.links.github} signup={<SiteSignup onSubmit={() => captureNewsletterSubscribed(posthog, 'skills')} />} legalLinks={<><a href={siteConfig.links.terms}>Terms</a><a href="/privacy">Privacy</a></>} />
}
