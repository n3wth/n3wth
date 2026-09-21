'use client'

import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'
import { captureNewsletterSubscribed } from '@n3wth/site-config/analytics'
import { site } from '@/lib/site'
import { SiteFooter as SharedSiteFooter, SiteSignup } from '@n3wth/ui/site'

export function SiteFooter() {
  const pathname = usePathname()

  if (pathname === '/') return null

  return <SharedSiteFooter sourceHref={site.githubUrl} signup={<SiteSignup onSubmit={() => captureNewsletterSubscribed(posthog, 'garden')} />} />
}
