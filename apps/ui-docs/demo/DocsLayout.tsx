import { type ComponentType } from 'react'
import { Link, useParams } from 'react-router'
import { SiteNav } from './SiteNav'
import { SiteFooter } from '@n3wth/ui/site'
import { siteUrls } from '@n3wth/site-config'
import { DocsSidebar } from './DocsSidebar'
import { SEO, JsonLdWebPage, JsonLdBreadcrumb } from './SEO'
import { NotFound } from './NotFound'

import { docPageMeta, type DocPageMeta } from './docPages'

const docModules = import.meta.glob<{ default: ComponentType }>([
  '../docs/getting-started.md',
  '../docs/theming.md',
  '../docs/components.md',
  '../docs/hooks.md',
  '../docs/css-utilities.md',
], { eager: true })

export interface DocPage extends DocPageMeta {
  Component: ComponentType
}

export const docPages: DocPage[] = docPageMeta.map((meta) => ({
  ...meta,
  Component: docModules[`../docs/${meta.slug}.md`].default,
}))

export function DocsLayout() {
  const { slug } = useParams()

  const currentPage = docPages.find((p) => p.slug === slug)

  if (!currentPage) return <NotFound />
  const Content = currentPage.Component

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
          <main id="main-content" tabIndex={-1} className="min-w-0 pt-8 lg:pt-0">
            <article className="prose">
              <Content />
            </article>
            <nav aria-label="Documentation pages" className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-[var(--glass-border)] pt-6 text-sm">
              {(() => {
                const index = docPages.findIndex((p) => p.slug === currentPage.slug)
                const prev = docPages[index - 1]
                const next = docPages[index + 1]
                return <>
                  {prev && (
                    <Link to={`/docs/${prev.slug}`} className="text-[var(--color-grey-400)] hover:text-[var(--color-white)]">
                      ← {prev.title}
                    </Link>
                  )}
                  {next && (
                    <Link to={`/docs/${next.slug}`} className="ml-auto text-[var(--color-grey-400)] hover:text-[var(--color-white)]">
                      {next.title} →
                    </Link>
                  )}
                </>
              })()}
            </nav>
          </main>
        </div>
      </div>

      <SiteFooter sourceHref="https://github.com/n3wth/ui" legalLinks={<a href={`${siteUrls.home}/privacy`}>Privacy</a>} />
    </div>
  )
}
