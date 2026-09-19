'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { initializeSiteAnalytics } from '@n3wth/site-config/analytics'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '[::1]') return

    initializeSiteAnalytics(posthog, {
      api_host: 'https://elephant.n3wth.com',
      ui_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      capture_performance: { web_vitals: true },
      disable_web_experiments: false,
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
