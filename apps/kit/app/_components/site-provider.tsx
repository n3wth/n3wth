'use client'

import { N3wthProvider } from '@n3wth/ui/site'
import type { ReactNode } from 'react'

export function SiteProvider({ children }: { children: ReactNode }) {
  return <N3wthProvider mode="dark">{children}</N3wthProvider>
}
