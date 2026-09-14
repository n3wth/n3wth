import { Link } from 'react-router'
import { PageHeader, SiteContainer } from '@n3wth/ui/site'
import { SEO } from './SEO'
import { SiteNav } from './SiteNav'

export function NotFound() {
  return <>
    <SEO title="Page not found" description="This documentation page does not exist." path="/404" noIndex />
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-accent)] focus:text-[var(--color-bg)] focus:rounded-lg focus:outline-none"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
    <SiteNav />
    <SiteContainer as="main" id="main-content" tabIndex={-1} className="n3wth-site-main">
      <PageHeader title="Page not found" description="This documentation page does not exist." actions={<Link to="/docs/getting-started">Browse documentation</Link>} />
    </SiteContainer>
  </>
}
