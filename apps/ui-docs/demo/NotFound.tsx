import { Link } from 'react-router'
import { PageHeader, SiteContainer } from '@n3wth/ui/site'
import { SEO } from './SEO'
import { SiteNav } from './SiteNav'

export function NotFound() {
  return <>
    <SEO title="Page not found" description="This documentation page does not exist." path="/404" noIndex />
    <SiteNav />
    <SiteContainer as="main" className="n3wth-site-main">
      <PageHeader title="Page not found" description="This documentation page does not exist." actions={<Link to="/docs/getting-started">Browse documentation</Link>} />
    </SiteContainer>
  </>
}
