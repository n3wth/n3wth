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
    sitemap: 'https://kit.n3wth.com/sitemap.xml',
    host: 'https://kit.n3wth.com',
  }
}
