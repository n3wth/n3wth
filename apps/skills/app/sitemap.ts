import { siteUrls } from '@n3wth/site-config'
import { MetadataRoute } from 'next'
import { skills } from '@/src/data/skills'
import { bundles } from '@/src/data/bundles'
import { workflowTemplates } from '@/src/data/workflows'
import { noindexSkillIds } from '@/src/config/indexability'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteUrls.skills

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/request-skill`, changeFrequency: 'monthly', priority: 0.5 },
    {
      url: baseUrl,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/curated-bundles`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/workflows`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contribute`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/submit`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  const skillPages: MetadataRoute.Sitemap = skills.filter(skill => !noindexSkillIds.has(skill.id)).map(skill => ({
    url: `${baseUrl}/skill/${skill.id}`,
    lastModified: new Date(skill.lastUpdated),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const bundlePages: MetadataRoute.Sitemap = bundles.map(bundle => ({
    url: `${baseUrl}/curated-bundles/${bundle.id}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const workflowPages: MetadataRoute.Sitemap = workflowTemplates.map(workflow => ({
    url: `${baseUrl}/workflows/${workflow.id}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...skillPages, ...bundlePages, ...workflowPages]
}
