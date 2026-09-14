import { siteUrls } from '@n3wth/site-config'
import type { MetadataRoute } from 'next'
import { posts } from './blog/posts'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrls.kit, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrls.kit}/components`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrls.kit}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrls.kit}/docs`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrls.kit}/docs/getting-started`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrls.kit}/docs/agents`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrls.kit}/changelog`, changeFrequency: 'weekly', priority: 0.5 },
    ...posts.map((post) => ({
      url: `${siteUrls.kit}/blog/${post.slug}`,
      lastModified: new Date(post.publishedIso),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
