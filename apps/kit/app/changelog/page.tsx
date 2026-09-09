import { PageHeader, SiteContainer, SiteSection, SiteHeading } from '@n3wth/ui/site'
import type { Metadata } from 'next'
import { siteUrls } from '@n3wth/site-config'
import { pageMetadata, pageJsonLd } from '@n3wth/site-config/metadata'

const url = `${siteUrls.kit}/changelog`
const socialTitle = 'Changelog — n3wth/kit'
const description = 'Latest updates and improvements to n3wth/kit. New components, features, and fixes.'

export const metadata: Metadata = pageMetadata({
  title: 'Changelog',
  description,
  url,
  socialTitle,
})

const webPageJsonLd = pageJsonLd({
  url,
  title: socialTitle,
  description: description,
  siteUrl: siteUrls.kit,
  type: 'WebPage',
  image: `${url}/opengraph-image`,
})

const entries = [
  {
    date: 'February 15, 2026',
    title: 'Business launch',
    changes: [
      'Added email waitlist capture on landing page',
      'Complete documentation for Antigravity CLI',
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
      'AI context packs (GEMINI.md, AGENTS.md, MCP config, components.json)',
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
      <SiteContainer as="main" className="n3wth-site-main">
        <PageHeader title="Changelog" description="Latest updates and improvements." />

        <SiteSection className="space-y-16">
          {entries.map((entry) => (
            <article key={entry.date}>
              <time className="text-sm text-ink-faint">{entry.date}</time>
              <SiteHeading variant="item" level={2}>
                {entry.title}
              </SiteHeading>
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
        </SiteSection>
      </SiteContainer>
    </div>
  )
}
