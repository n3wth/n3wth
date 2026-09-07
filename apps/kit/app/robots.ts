import { siteUrls } from '@n3wth/site-config'
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/checkout/'],
      },
    ],
    sitemap: `${siteUrls.kit}/sitemap.xml`,
    host: siteUrls.kit,
  }
}
