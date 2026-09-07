import type { MetadataRoute } from 'next'

import { site } from '@/lib/site'

const BASE_URL = site.url

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /random is a redirect that answers differently on every hit, so a
      // crawler following it just burns budget re-fetching notes it has.
      disallow: ['/random', '/og/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
