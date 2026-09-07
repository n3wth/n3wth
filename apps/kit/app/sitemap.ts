import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://kit.n3wth.com', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://kit.n3wth.com/components', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://kit.n3wth.com/r/registry.json', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://kit.n3wth.com/blog', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://kit.n3wth.com/ai/cursorrules', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://kit.n3wth.com/ai/AGENTS.md', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://kit.n3wth.com/ai/components.json', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://kit.n3wth.com/ai/mcp.json', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://kit.n3wth.com/docs', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://kit.n3wth.com/docs/getting-started', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://kit.n3wth.com/docs/cursor', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://kit.n3wth.com/docs/agents', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://kit.n3wth.com/docs/v0', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://kit.n3wth.com/docs/lovable', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://kit.n3wth.com/changelog', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: 'https://kit.n3wth.com/blog/why-ai-tools-generate-ugly-code', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://kit.n3wth.com/blog/shadcn-registry-protocol', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://kit.n3wth.com/blog/ai-context-packs-explained', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://kit.n3wth.com/blog/shadcn-registry-protocol-deep-dive', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://kit.n3wth.com/blog/why-every-ai-tool-generates-same-ui', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://kit.n3wth.com/llms.txt', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]
}
