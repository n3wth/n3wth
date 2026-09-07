import type { Metadata, Viewport } from 'next'
import { AxiomWebVitals } from 'next-axiom'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Providers } from './providers'
import { PostHogProvider } from '../src/components/PostHogProvider'
import { WebSiteJsonLd } from '../src/components/seo/JsonLd'
import '../src/index.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://skills.n3wth.com'),
  title: {
    default: 'n3wth/skills',
    template: '%s | n3wth/skills',
  },
  description:
    'Markdown skills for Gemini CLI, Cursor, Windsurf, and Copilot. 46 skills. One install, works offline.',
  authors: [{ name: 'Oliver Newth', url: 'https://n3wth.com' }],
  creator: 'n3wth',
  publisher: 'n3wth',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://skills.n3wth.com',
    siteName: 'n3wth/skills',
    title: 'n3wth/skills',
    description:
      'Markdown skills for Gemini CLI, Cursor, Windsurf, and Copilot. 46 skills. One install, works offline.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'n3wth/skills',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'n3wth/skills',
    description:
      'Markdown skills for coding agents. One install, works offline.',
    images: ['/twitter-image'],
    creator: '@olivernewth',
  },
  alternates: {
    canonical: 'https://skills.n3wth.com',
  },
  other: {
    'msapplication-TileColor': '#000000',
  },
}

export const viewport: Viewport = {
  themeColor: '#3d3d3d',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <AxiomWebVitals />
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AI Skills" />
        <WebSiteJsonLd />
      </head>
      <body>
        <a
          href="#main-content"
          className="fixed -translate-y-full focus:translate-y-0 top-4 left-4 z-50 px-4 py-2 bg-white text-black rounded-md outline-none ring-2 ring-offset-2 transition-transform"
          tabIndex={0}
          data-nosnippet=""
        >
          Skip to main content
        </a>
        <PostHogProvider>
          <Providers>{children}</Providers>
        </PostHogProvider>
      </body>
      <GoogleAnalytics gaId="G-4QRMSG5HXK" />
    </html>
  )
}
