import { MetadataRoute } from 'next'
import { skills } from '@/src/data/skills'
import { bundles } from '@/src/data/bundles'
import { workflowTemplates } from '@/src/data/workflows'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://skills.n3wth.com'

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/curated-bundles`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/workflows`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contribute`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  const skillPages: MetadataRoute.Sitemap = skills.map(skill => ({
    url: `${baseUrl}/skill/${skill.id}`,
    lastModified: new Date(skill.lastUpdated),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const bundlePages: MetadataRoute.Sitemap = bundles.map(bundle => ({
    url: `${baseUrl}/curated-bundles/${bundle.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const workflowPages: MetadataRoute.Sitemap = workflowTemplates.map(workflow => ({
    url: `${baseUrl}/workflows/${workflow.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...skillPages, ...bundlePages, ...workflowPages]
}
