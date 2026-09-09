'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { initializeSiteAnalytics } from '@n3wth/site-config/analytics'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeSiteAnalytics(posthog, {
      api_host: 'https://us.i.posthog.com',
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
