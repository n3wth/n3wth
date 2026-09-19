import { Link } from 'react-router'
import { PageHeader, SiteContainer, SiteSection, SiteHeading, SiteText, SiteFooter } from '@n3wth/ui/site'
import { Signup } from './Signup'
import { siteUrls } from '@n3wth/site-config'
import { SiteNav } from './SiteNav'
import { docPageMeta } from './docPages'
import { SystemGarden } from './SystemGarden'
import { SEO, JsonLdWebSite } from './SEO'

const layers = [
  { name: 'Sites', href: 'https://github.com/n3wth/n3wth/tree/main/apps', description: 'Your content, routes and ideas. The part that makes each site its own.' },
  { name: '@n3wth/ui', href: 'https://github.com/n3wth/n3wth/tree/main/packages/ui', description: 'Type, colour and page compositions. A common foundation across the family.' },
  { name: 'Astryx', href: 'https://github.com/facebook/astryx', description: 'The controls underneath, with native interactions and keyboard behaviour.' },
]

export function SystemHome() {
  return <>
    <SEO title="n3wth/ui design system" description="A shared foundation for individual ideas. Explore typography, components and page patterns built on Astryx." path="/" />
    <JsonLdWebSite />
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-accent)] focus:text-[var(--color-bg)] focus:rounded-lg focus:outline-none" aria-label="Skip to main content">Skip to main content</a>
    <SiteNav />
    <SiteContainer as="main" id="main-content" tabIndex={-1} className="n3wth-site-main">
      <PageHeader
        title="Make room for your next idea."
        description="A shared foundation for individual sites. Thoughtful type, useful controls and space for your content to lead."
        actions={<Link to="/docs/getting-started">Get started</Link>}
        align="center"
        className="system-home-header"
      />
      <SystemGarden />
      <SiteSection aria-labelledby="documentation">
        <div className="system-section-intro">
          <SiteHeading id="documentation">Start with what you need.</SiteHeading>
          <SiteText>No new visual language to invent. Just the parts that help you build.</SiteText>
        </div>
        <ul className="system-docs system-docs-home">
          {docPageMeta.map(page => <li key={page.slug}>
            <SiteHeading variant="item"><Link to={`/docs/${page.slug}`}>{page.title}</Link></SiteHeading>
            <SiteText variant="supporting">{page.description}</SiteText>
          </li>)}
        </ul>
      </SiteSection>
      <SiteSection aria-labelledby="architecture">
        <SiteHeading id="architecture">One foundation. Different possibilities.</SiteHeading>
        <ol className="system-layers">
          {layers.map(layer => <li key={layer.name}>
            <SiteHeading variant="item"><a href={layer.href}>{layer.name}</a></SiteHeading>
            <SiteText variant="supporting">{layer.description}</SiteText>
          </li>)}
        </ol>
        <div className="system-source-note"><SiteText variant="supporting" className="max-w-[52ch]">These examples use the workspace package. Check the published exports before using them outside this repository.</SiteText></div>
      </SiteSection>
    </SiteContainer>
    <SiteFooter sourceHref="https://github.com/n3wth/n3wth/tree/main/packages/ui" signup={<Signup />} legalLinks={<a href={`${siteUrls.home}/privacy`}>Privacy</a>} />
  </>
}
