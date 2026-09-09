import { siteUrls } from '@n3wth/site-config'
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrls.kit, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrls.kit}/components`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrls.kit}/r/registry.json`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrls.kit}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrls.kit}/ai/GEMINI.md`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrls.kit}/ai/AGENTS.md`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrls.kit}/ai/components.json`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrls.kit}/ai/mcp.json`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrls.kit}/docs`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrls.kit}/docs/getting-started`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrls.kit}/docs/agents`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrls.kit}/changelog`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${siteUrls.kit}/blog/shadcn-registry-protocol`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrls.kit}/blog/shadcn-registry-protocol-deep-dive`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrls.kit}/llms.txt`, changeFrequency: 'monthly', priority: 0.3 },
  ]
}
