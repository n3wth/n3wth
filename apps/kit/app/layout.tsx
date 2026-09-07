import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Nav } from './_components/nav'
import { SkipLink } from './_components/skip-link'
import { PostHogProvider } from './_components/posthog-provider'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://kit.n3wth.com'),
  title: {
    default: 'n3wth/kit — shadcn registry with AI context packs',
    template: '%s — n3wth/kit',
  },
  description:
    'A shadcn component registry with AI context packs. Install components via npx shadcn add, then drop in .cursorrules or AGENTS.md so AI tools generate code that uses them correctly.',
  keywords: [
    'design system',
    'AI components',
    'shadcn',
    'React',
    'Tailwind CSS',
    'v0',
    'Cursor',
    'Windsurf',
    'Lovable',
    'component registry',
    'AI code generation',
    'context packs',
    'cursorrules',
  ],
  authors: [{ name: 'Oliver Newth' }],
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: 'n3wth/kit — shadcn registry with AI context packs',
    description: 'A shadcn component registry with AI context packs. Install via npx shadcn add, then drop in .cursorrules or AGENTS.md.',
    url: 'https://kit.n3wth.com',
    siteName: 'n3wth/kit',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'n3wth/kit — shadcn registry with AI context packs',
    description: 'A shadcn component registry with AI context packs. Install via npx shadcn add, then drop in .cursorrules or AGENTS.md.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://kit.n3wth.com/#website',
  name: 'n3wth/kit',
  url: 'https://kit.n3wth.com',
  description: 'A shadcn component registry with AI context packs for v0, Cursor, Windsurf, Lovable, and Cline.',
  publisher: {
    '@type': 'Organization',
    name: 'n3wth',
    url: 'https://n3wth.com',
    email: 'hey@n3wth.com',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://kit.n3wth.com/components?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareSourceCode',
  '@id': 'https://kit.n3wth.com/#software',
  name: 'n3wth/kit',
  description: 'A shadcn component registry with AI context packs. 49 items: 32 UI components, 4 blocks, 11 hooks, 1 utility, 1 design style.',
  url: 'https://kit.n3wth.com',
  codeRepository: 'https://github.com/n3wth/kit',
  programmingLanguage: ['TypeScript', 'React', 'Tailwind CSS'],
  runtimePlatform: 'Node.js',
  license: 'https://opensource.org/licenses/MIT',
  author: {
    '@type': 'Person',
    name: 'Oliver Newth',
    url: 'https://n3wth.com',
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
    <html lang="en">
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
          <SkipLink />
          <Nav />
          <div id="main-content">
            {children}
          </div>
          <Analytics />
          <SpeedInsights />
        </PostHogProvider>
        <GoogleAnalytics gaId="G-4QRMSG5HXK" />
      </body>
    </html>
  )
}
