import { useEffect, type ComponentType } from 'react'
import { useParams } from 'react-router'
import { SiteNav } from './SiteNav'
import { SiteFooter } from '@n3wth/ui/site'
import { siteUrls } from '@n3wth/site-config'
import { DocsSidebar } from './DocsSidebar'
import { SEO, JsonLdWebPage, JsonLdBreadcrumb } from './SEO'

const docModules = import.meta.glob<{ default: ComponentType }>([
  '../docs/getting-started.md',
  '../docs/theming.md',
  '../docs/components.md',
  '../docs/hooks.md',
  '../docs/css-utilities.md',
], { eager: true })

export interface DocPage {
  slug: string
  title: string
  description: string
  Component: ComponentType
}

const DOC_DESCRIPTIONS: Record<string, string> = {
  'getting-started': 'Create a site in the workspace using the shared UI page system and Astryx primitives.',
  'theming': 'Shared brand tokens, typography, fonts and provider ownership.',
  'components': 'Choose between site compositions, native Astryx primitives and existing UI adapters.',
  'hooks': 'Theme state, focus behavior and intentional product feedback.',
  'css-utilities': 'Site styles, the Tailwind theme facade and compatibility CSS.',
}

function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/css /i, 'CSS ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export const docPages: DocPage[] = Object.entries(docModules)
  .map(([path, mod]) => {
    const slug = path.replace('../docs/', '').replace('.md', '')
    return {
      slug,
      title: slugToTitle(slug),
      description: DOC_DESCRIPTIONS[slug] || `Documentation for ${slugToTitle(slug)} in @n3wth/ui design system.`,
      Component: mod.default,
    }
  })
  .sort((a, b) => {
    const order = ['getting-started', 'theming', 'components', 'hooks', 'css-utilities']
    return order.indexOf(a.slug) - order.indexOf(b.slug)
  })

export function DocsLayout() {
  const { slug } = useParams()

  const currentPage = docPages.find((p) => p.slug === slug) ?? docPages[0]
  const Content = currentPage.Component

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  const pageUrl = `https://ui.n3wth.com/docs/${currentPage.slug}`

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-white)]">
      <SEO
        title={currentPage.title}
        description={currentPage.description}
        path={`/docs/${currentPage.slug}`}
        ogImage={`/og/${currentPage.slug}.png`}
      />
      <JsonLdWebPage
        title={`${currentPage.title} | @n3wth/ui`}
        description={currentPage.description}
        url={pageUrl}
      />
      <JsonLdBreadcrumb
        items={[
          { name: '@n3wth/ui', url: 'https://ui.n3wth.com' },
          { name: 'Docs', url: 'https://ui.n3wth.com/docs/getting-started' },
          { name: currentPage.title, url: pageUrl },
        ]}
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-accent)] focus:text-[var(--color-bg)] focus:rounded-lg focus:outline-none"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      <SiteNav />

      <div className="n3wth-site-main n3wth-site-container">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
          <DocsSidebar items={docPages.map(page => ({ id: page.slug, label: page.title, href: `/docs/${page.slug}` }))} activeId={currentPage.slug} label="Documentation" />

          {/* Content */}
          <main id="main-content" className="min-w-0 pt-8 lg:pt-0">
            <article className="prose">
              <Content />
            </article>
          </main>
        </div>
      </div>

      <SiteFooter sourceHref="https://github.com/n3wth/ui" legalLinks={<a href={`${siteUrls.home}/privacy`}>Privacy</a>} />
    </div>
  )
}
