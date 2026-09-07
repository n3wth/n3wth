import { useEffect } from 'react'

/** Options for page metadata beyond title and description. */
export interface PageMetaOptions {
  /** Whether to add noindex robots meta (for soft-404s, login pages). */
  noindex?: boolean
  /** Custom OG image path relative to site root (defaults to page-specific og/[slug].png). */
  ogImage?: string
  /** JSON-LD structured data objects to inject. */
  jsonLd?: object | object[]
  /** Canonical path override (defaults to current pathname). */
  canonical?: string
}

/** Production site URL for JSON-LD and absolute image URLs. */
const SITE_URL = 'https://n3wth.com'

/**
 * Per-route document title + meta description + OG tags + JSON-LD for SPA routes.
 * Updates all relevant meta tags on mount and cleans up JSON-LD on unmount.
 */
export function usePageMeta(
  title: string,
  description?: string,
  opts?: PageMetaOptions
) {
  const noindex = opts?.noindex ?? false
  const ogImage = opts?.ogImage
  const jsonLd = opts?.jsonLd
  const canonical = opts?.canonical

  useEffect(() => {
    document.title = title

    if (description) {
      const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (meta) meta.content = description
    }

    // Canonical + OG URLs - use origin for runtime URLs (works in dev and prod)
    const pathname = canonical ?? window.location.pathname
    const url = window.location.origin + pathname
    const canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonicalEl) canonicalEl.href = url
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]')
    if (ogUrl) ogUrl.content = url

    // OG Title/Description
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
    if (ogTitle) ogTitle.content = title
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')
    if (ogDescription && description) ogDescription.content = description
    const twitterTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')
    if (twitterTitle) twitterTitle.content = title
    const twitterDescription = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')
    if (twitterDescription && description) twitterDescription.content = description

    // OG Image
    if (ogImage) {
      const imageUrl = ogImage.startsWith('http') ? ogImage : SITE_URL + ogImage
      const ogImageEl = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')
      if (ogImageEl) ogImageEl.content = imageUrl
      const ogImageAlt = document.querySelector<HTMLMetaElement>('meta[property="og:image:alt"]')
      if (ogImageAlt) ogImageAlt.content = title
      const twitterImage = document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')
      if (twitterImage) twitterImage.content = imageUrl
      const twitterImageAlt = document.querySelector<HTMLMetaElement>('meta[name="twitter:image:alt"]')
      if (twitterImageAlt) twitterImageAlt.content = title
    }

    // Noindex robots meta
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const createdRobots = !robots && noindex
    if (noindex) {
      if (!robots) {
        robots = document.createElement('meta')
        robots.name = 'robots'
        document.head.appendChild(robots)
      }
      robots.content = 'noindex'
    }

    // JSON-LD injection
    const scriptIds: string[] = []
    if (jsonLd) {
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd]
      schemas.forEach((schema, idx) => {
        const id = `json-ld-page-${idx}`
        scriptIds.push(id)
        // Remove existing script with same id if present
        document.getElementById(id)?.remove()
        const script = document.createElement('script')
        script.id = id
        script.type = 'application/ld+json'
        script.textContent = JSON.stringify(schema)
        document.head.appendChild(script)
      })
    }

    return () => {
      if (createdRobots && robots) robots.remove()
      scriptIds.forEach(id => document.getElementById(id)?.remove())
    }
  }, [title, description, noindex, ogImage, jsonLd, canonical])
}

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

  // WebSite schema (for site-wide context)
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'Oliver Newth',
    description: 'AI product lead at Google. Ships with a standing agent team; builds large-scale light art.',
    publisher: { '@id': `${SITE_URL}/#person` },
  })

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
  datePublished: string
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
