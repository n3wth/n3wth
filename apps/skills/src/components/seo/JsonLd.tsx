import Script from 'next/script'
import { siteConfig } from '@/src/config/site'

interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  )
}

export function WebSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    alternateName: ['n3wth/skills', 'skills.n3wth.com'],
    description: 'Markdown skills for Antigravity CLI',
    url: 'https://skills.n3wth.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://skills.n3wth.com/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'n3wth',
      url: 'https://n3wth.com',
      email: 'hey@n3wth.com',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

interface WebPageJsonLdProps {
  title: string
  description: string
  url: string
  dateModified?: string
  breadcrumbs?: Array<{ name: string; url: string }>
}

export function WebPageJsonLd({ title, description, url, dateModified, breadcrumbs }: WebPageJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.name,
      url: 'https://skills.n3wth.com',
    },
  }

  if (dateModified) {
    data.dateModified = dateModified
  }

  if (breadcrumbs?.length) {
    data.breadcrumb = {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

interface SoftwareApplicationJsonLdProps {
  name: string
  description: string
  url: string
  version: string
  dateModified: string
  category: string
  operatingSystem?: string
  applicationCategory?: string
  keywords?: string[]
}

export function SoftwareApplicationJsonLd({
  name,
  description,
  url,
  version,
  dateModified,
  category,
  keywords,
}: SoftwareApplicationJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    softwareVersion: version,
    dateModified,
    applicationCategory: category,
    operatingSystem: 'Cross-platform',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: 'n3wth',
      url: 'https://n3wth.com',
    },
  }

  if (keywords?.length) {
    data.keywords = keywords.join(', ')
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

interface TechArticleJsonLdProps {
  title: string
  description: string
  url: string
  dateModified?: string
  datePublished?: string
  keywords?: string[]
  proficiencyLevel?: string
}

export function TechArticleJsonLd({
  title,
  description,
  url,
  dateModified,
  datePublished,
  keywords,
  proficiencyLevel = 'Beginner',
}: TechArticleJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    proficiencyLevel,
    author: {
      '@type': 'Person',
      name: 'Oliver Newth',
      url: 'https://n3wth.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'n3wth',
      url: 'https://n3wth.com',
    },
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.name,
      url: 'https://skills.n3wth.com',
    },
  }

  if (dateModified) {
    data.dateModified = dateModified
  }
  if (datePublished) {
    data.datePublished = datePublished
  }
  if (keywords?.length) {
    data.keywords = keywords.join(', ')
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

interface ItemListJsonLdProps {
  name: string
  description: string
  url: string
  items: Array<{
    name: string
    url: string
    description?: string
  }>
}

export function ItemListJsonLd({ name, description, url, items }: ItemListJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
      ...(item.description && { description: item.description }),
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

interface FaqJsonLdProps {
  questions: Array<{ question: string; answer: string }>
}

export function FaqJsonLd({ questions }: FaqJsonLdProps) {
  if (questions.length === 0) return null

  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
