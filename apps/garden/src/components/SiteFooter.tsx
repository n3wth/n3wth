'use client'

import { usePathname } from 'next/navigation'
import { site } from '@/lib/site'
import { SiteFooter as SharedSiteFooter } from '@n3wth/ui/site'

export function SiteFooter() {
  const pathname = usePathname()

  if (pathname === '/') return null

  return <SharedSiteFooter sourceHref={site.githubUrl} />
}
