import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Latest updates and improvements to n3wth/kit. New components, features, and fixes.',
  alternates: {
    canonical: 'https://kit.n3wth.com/changelog',
  },
  openGraph: {
    title: 'Changelog — n3wth/kit',
    description: 'Latest updates and improvements to n3wth/kit. New components, features, and fixes.',
    url: 'https://kit.n3wth.com/changelog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Changelog — n3wth/kit',
    description: 'Latest updates and improvements to n3wth/kit. New components, features, and fixes.',
  },
}

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://kit.n3wth.com/changelog#webpage',
  url: 'https://kit.n3wth.com/changelog',
  name: 'Changelog — n3wth/kit',
  description: 'Latest updates and improvements to n3wth/kit. New components, features, and fixes.',
  isPartOf: { '@id': 'https://kit.n3wth.com/#website' },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: 'https://kit.n3wth.com/changelog/opengraph-image',
  },
}

const entries = [
  {
    date: 'February 15, 2026',
    title: 'Business launch',
    changes: [
      'Added email waitlist capture on landing page',
      'Complete documentation for Cursor, Windsurf, v0, and Lovable',
      'Blog with technical content for SEO',
      'Interactive component page with search, filter, and copy-to-clipboard',
      'Mobile hamburger navigation',
      'Vercel Analytics and Speed Insights',
      'Sitemap, robots.txt, and Open Graph images',
      'MIT license and proper README',
    ],
  },
  {
    date: 'February 14, 2026',
    title: 'Landing page redesign',
    changes: [
      'New hero with GSAP animations and floating design elements',
      'Live component showcase grid with 6 interactive demos',
      'Before/after code comparison section',
      'Scroll-aware navigation with backdrop blur',
    ],
  },
  {
    date: 'February 12, 2026',
    title: 'Initial release',
    changes: [
      '32 UI components + 4 blocks + 11 hooks, built on Tailwind CSS v4',
      'AI context packs (.cursorrules, AGENTS.md, MCP config, components.json)',
      'shadcn registry protocol support',
      'CLI tool for project scaffolding',
      'Marketing site with documentation',
    ],
  },
]

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <main className="mx-auto max-w-2xl px-6 pt-32 pb-24">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Changelog
        </h1>
        <p className="mt-3 text-ink-dim">
          Latest updates and improvements.
        </p>

        <div className="mt-16 space-y-16">
          {entries.map((entry) => (
            <article key={entry.date}>
              <time className="text-sm text-ink-faint">{entry.date}</time>
              <h2 className="mt-2 text-xl font-semibold text-ink">
                {entry.title}
              </h2>
              <ul className="mt-4 space-y-2">
                {entry.changes.map((change) => (
                  <li key={change} className="flex items-start gap-2 text-sm text-ink-dim">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                    {change}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
