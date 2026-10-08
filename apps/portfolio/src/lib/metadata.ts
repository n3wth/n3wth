const SITE_URL = 'https://n3wth.com'

/** Build WebPage JSON-LD for an inner page. */
export function buildWebPageSchema(opts: {
  url: string
  title: string
  description: string
  datePublished?: string
  dateModified?: string
  breadcrumbs?: Array<{ name: string; url: string }>
}): object[] {
  const schemas: object[] = []

  // The persistent WebSite schema is supplied by index.html on every route.

  // WebPage schema
  const webPage: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': opts.url,
    url: opts.url,
    name: opts.title,
    description: opts.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#person` },
    inLanguage: 'en-US',
  }
  if (opts.datePublished) webPage.datePublished = opts.datePublished
  if (opts.dateModified) webPage.dateModified = opts.dateModified
  schemas.push(webPage)

  // BreadcrumbList schema
  if (opts.breadcrumbs && opts.breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: opts.breadcrumbs.map((crumb, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    })
  }

  return schemas
}

/** Build Article JSON-LD for a thinking piece. */
export function buildArticleSchema(opts: {
  url: string
  title: string
  description: string
  datePublished?: string
  dateModified?: string
  image?: string
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': opts.url,
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    image: opts.image ?? `${SITE_URL}/og-image.png`,
    author: { '@id': `${SITE_URL}/#person` },
    publisher: { '@id': `${SITE_URL}/#person` },
    mainEntityOfPage: { '@id': opts.url },
    inLanguage: 'en-US',
  }
}
