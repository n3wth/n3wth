'use client'

import { N3wthProvider, useRouteScrollReset } from '@n3wth/ui/site'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export function SiteProvider({ children }: { children: ReactNode }) {
  useRouteScrollReset(usePathname())
  return <N3wthProvider mode="dark">{children}</N3wthProvider>
}
