import type { Metadata } from "next";
import { siteUrls } from "@n3wth/site-config";
import { googleAnalyticsScript } from "@n3wth/site-config/analytics";
import { AxiomWebVitals } from "next-axiom";
import { PostHogProvider } from "../components/PostHogProvider";
import { JsonLd } from "../components/JsonLd";
import { SkipLink } from "../components/SkipLink";
import { SiteProvider } from "../components/SiteProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrls.r3),
  title: {
    default: "n3wth/r3 - Persistent memory for AI assistants",
    template: "%s - n3wth/r3",
  },
  description:
    "An MCP server that gives AI assistants persistent memory. Local Redis, vector search, and knowledge graphs.",
  keywords: [
    "r3",
    "MCP server",
    "AI memory",
    "Redis",
    "vector search",
    "persistent memory",
  ],
  authors: [{ name: "Oliver Newth" }],
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "n3wth/r3 - Persistent memory for AI assistants",
    description:
      "An MCP server that gives AI assistants persistent memory. Local Redis, vector search, knowledge graphs. Install with npx @n3wth/r3.",
    url: siteUrls.r3,
    siteName: "n3wth/r3",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "n3wth/r3 - Persistent memory for AI assistants",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "n3wth/r3 - Persistent memory for AI assistants",
    description:
      "An MCP server that gives AI assistants persistent memory. Local Redis, vector search, knowledge graphs. Install with npx @n3wth/r3.",
    images: [
      {
        url: "/twitter-image",
        width: 1200,
        height: 630,
        alt: "n3wth/r3 - Persistent memory for AI assistants",
      },
    ],
    creator: "@n3wth",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-astryx-theme="n3wth"
      suppressHydrationWarning
    >
      <AxiomWebVitals />
      <head>
        <JsonLd type="WebSite" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#08090b" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.getRegistration('/').then(function(registration) {
                    if (registration) registration.update();
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        <SkipLink />
        <PostHogProvider>
          <SiteProvider>
          {children}
          </SiteProvider>
        </PostHogProvider>
        <script dangerouslySetInnerHTML={{ __html: googleAnalyticsScript }} />
      </body>
    </html>
  );
}
