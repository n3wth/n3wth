'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

interface PageViewTrackerProps {
  event: string
  properties?: Record<string, string | number | boolean>
}

export function PageViewTracker({ event, properties }: PageViewTrackerProps) {
  useEffect(() => {
    posthog.capture(event, properties)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
