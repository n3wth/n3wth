'use client'
import { PageHeader, SiteContainer } from '@n3wth/ui/site'
import { siteConfig } from '../config/site'

export function Hero() {
  return (
    <SiteContainer className="n3wth-site-main">
      <PageHeader
        align="center"
        title={siteConfig.name}
        description={`${siteConfig.description} ${siteConfig.tagline}`}
      />
    </SiteContainer>
  )
}
