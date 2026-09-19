import { docsConfig } from './docs-config.ts';

export type SitemapPage = {
  url: string;
  changefreq: string;
  priority: string;
};

export function getSitemapPages(baseUrl: string): SitemapPage[] {
  const staticPages = [
    { url: baseUrl, changefreq: 'monthly', priority: '1.0' },
    { url: `${baseUrl}/docs`, changefreq: 'weekly', priority: '0.9' },
  ];

  const docsPages = docsConfig.flatMap((section) =>
    section.items.map((doc) => ({
      url: `${baseUrl}/docs/${doc.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    })),
  );

  return [...staticPages, ...docsPages];
}
