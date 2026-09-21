'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { submitNewsletter, newsletterErrorMessage } from '@n3wth/site-config/newsletter'
import posthog from 'posthog-js'
import { captureNewsletterSubscribed } from '@n3wth/site-config/analytics'
import { site } from '@/lib/site'
import { SiteFooter as SharedSiteFooter, SiteSignup } from '@n3wth/ui/site'

export function SiteFooter() {
  const pathname = usePathname()
  const [errorMessage, setErrorMessage] = useState<string>()

  async function subscribe(address: string) {
    try {
      await submitNewsletter(address, 'garden', { endpoint: process.env.NEXT_PUBLIC_SUBSCRIBE_ENDPOINT })
    } catch (error) {
      setErrorMessage(newsletterErrorMessage(error))
      throw error
    }
    captureNewsletterSubscribed(posthog, 'garden')
  }

  if (pathname === '/') return null

  return <SharedSiteFooter sourceHref={site.githubUrl} signup={<SiteSignup onSubmit={subscribe} errorMessage={errorMessage} />} />
}
