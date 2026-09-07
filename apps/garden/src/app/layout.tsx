import type { Metadata, Viewport } from 'next'
import { ViewTransitions } from 'next-view-transitions'
import { GoogleAnalytics } from '@next/third-parties/google'
import { AxiomWebVitals } from 'next-axiom'
import { getAllNotes } from '@/lib/content'
import { site } from '@/lib/site'
import { Navigation } from '@/components/Navigation'
import { SiteFooter } from '@/components/SiteFooter'
import { PostHogProvider } from '@/components/PostHogProvider'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'n3wth/garden',
    template: '%s | n3wth/garden',
  },
  description: 'Working notes. Linked.',
  metadataBase: new URL(site.url),
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'n3wth/garden' }],
    },
  },
  openGraph: {
    siteName: 'n3wth/garden',
    type: 'website',
    url: './',
  },
  twitter: {
    card: 'summary_large_image',
  },
  authors: [{ name: 'Oliver Newth', url: site.parentUrl }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icon-192.png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'garden',
  },
}

export const viewport: Viewport = {
  themeColor: '#08090b',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const paletteNotes = getAllNotes()
    .filter((n) => n.slug !== '')
    .map((n) => ({
      slug: n.slug,
      title: n.title,
      tags: n.tags,
      stage: n.stage,
      description: n.description,
    }))

  return (
    <ViewTransitions>
    <html lang="en" data-theme="dark">
      <head>
        {/* The LCP h1 sets in Satoshi 600 (font-display + font-semibold) —
            preload it so the headline doesn't paint in system-ui and reflow. */}
        <link
          rel="preload"
          href="/fonts/Satoshi-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <AxiomWebVitals />
      <GoogleAnalytics gaId="G-4QRMSG5HXK" />
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'n3wth/garden',
              url: site.url,
              description: 'Working notes. Linked.',
              author: { '@type': 'Person', name: 'Oliver Newth', url: site.parentUrl },
            }),
          }}
        />
        <a href="#main" className="skip-link" data-nosnippet>
          Skip to content
        </a>
        <Providers>
          <PostHogProvider>
            <Navigation paletteNotes={paletteNotes} />
            {/* tabIndex so the skip link moves DOM focus here, not just
                the scroll position */}
            <main id="main" tabIndex={-1} className="flex-1 pt-20 outline-none">
              {children}
            </main>
            <SiteFooter />
          </PostHogProvider>
        </Providers>
      </body>
    </html>
    </ViewTransitions>
  )
}
