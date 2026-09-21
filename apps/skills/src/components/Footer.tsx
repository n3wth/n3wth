'use client'

import posthog from 'posthog-js'
import { useState } from 'react'
import { submitNewsletter, newsletterErrorMessage } from '@n3wth/site-config/newsletter'
import { captureNewsletterSubscribed } from '@n3wth/site-config/analytics'
import { SiteFooter, SiteSignup } from '@n3wth/ui/site'
import { siteConfig } from '../config/site'

export function Footer() {
  const [errorMessage, setErrorMessage] = useState<string>()
  async function subscribe(address: string) {
    try {
      await submitNewsletter(address, 'skills', { endpoint: process.env.NEXT_PUBLIC_SUBSCRIBE_ENDPOINT })
    } catch (error) {
      setErrorMessage(newsletterErrorMessage(error))
      throw error
    }
    captureNewsletterSubscribed(posthog, 'skills')
  }
  return <SiteFooter sourceHref={siteConfig.links.github} signup={<SiteSignup onSubmit={subscribe} errorMessage={errorMessage} />} legalLinks={<><a href={siteConfig.links.terms}>Terms</a><a href="/privacy">Privacy</a></>} />
}
