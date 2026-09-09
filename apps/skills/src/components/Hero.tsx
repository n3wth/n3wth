'use client'
import { PageHeader, SiteContainer } from '@n3wth/ui/site'
import { siteConfig } from '../config/site'

export function Hero() {
  return (
    <SiteContainer className="n3wth-site-main">
      <PageHeader
        title="Skills for coding agents"
        description={`${siteConfig.description} ${siteConfig.tagline}`}
      />
    </SiteContainer>
  )
}
