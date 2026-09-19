import { Footer } from './_components/footer'
import { siteUrls } from '@n3wth/site-config'
import type { Metadata } from 'next'
import { googleAnalyticsScript } from '@n3wth/site-config/analytics'
import { Nav } from './_components/nav'
import { SkipLink } from './_components/skip-link'
import { PostHogProvider } from './_components/posthog-provider'
import { SiteProvider } from './_components/site-provider'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrls.kit),
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  title: {
    default: 'n3wth/kit — shadcn registry with AI context packs',
    template: '%s — n3wth/kit',
  },
  description:
    'A shadcn component registry with AI context packs. Install components via npx shadcn add, then drop in GEMINI.md so AI tools generate code that uses them correctly.',
  keywords: [
    'design system',
    'AI components',
    'shadcn',
    'React',
    'Tailwind CSS',
    'Antigravity CLI',
    'component registry',
    'AI code generation',
    'context packs',
    'GEMINI.md',
  ],
  authors: [{ name: 'Oliver Newth' }],
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: 'n3wth/kit — shadcn registry with AI context packs',
    description: 'A shadcn component registry with AI context packs. Install via npx shadcn add, then drop in GEMINI.md.',
    url: siteUrls.kit,
    siteName: 'n3wth/kit',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'n3wth/kit — shadcn registry with AI context packs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'n3wth/kit — shadcn registry with AI context packs',
    description: 'A shadcn component registry with AI context packs. Install via npx shadcn add, then drop in GEMINI.md.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'n3wth/kit — shadcn registry with AI context packs',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrls.kit}/#website`,
  name: 'n3wth/kit',
  url: siteUrls.kit,
  description: 'A shadcn component registry with AI context packs for Antigravity CLI.',
  publisher: {
    '@type': 'Organization',
    name: 'n3wth',
    url: siteUrls.home,
    email: 'hey@n3wth.com',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrls.kit}/components?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareSourceCode',
  '@id': `${siteUrls.kit}/#software`,
  name: 'n3wth/kit',
  description: 'A shadcn component registry with AI context packs. 49 items: 32 UI components, 4 blocks, 11 hooks, 1 utility, 1 design style.',
  url: siteUrls.kit,
  codeRepository: 'https://github.com/n3wth/n3wth/tree/main/apps/kit',
  programmingLanguage: ['TypeScript', 'React', 'Tailwind CSS'],
  runtimePlatform: 'Node.js',
  license: 'https://opensource.org/licenses/MIT',
  author: {
    '@type': 'Person',
    name: 'Oliver Newth',
    url: siteUrls.home,
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="dark" data-astryx-theme="n3wth">
      <head>
        <link rel="alternate" type="application/rss+xml" title="n3wth/kit Blog" href="/feed.xml" />
      </head>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
        <PostHogProvider>
          <SiteProvider>
          <SkipLink />
          <Nav />
          <div className="outline-none">{children}</div>
          <Footer />
          </SiteProvider>
        </PostHogProvider>
        <script dangerouslySetInnerHTML={{ __html: googleAnalyticsScript }} />
      </body>
    </html>
  )
}
