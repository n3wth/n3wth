import { useState } from 'react'
import { Button } from '@n3wth/ui/primitives'
import { Link } from 'react-router'
import { PageHeader, SiteContainer, SiteSection, SiteHeading, SiteText, SiteFooter } from '@n3wth/ui/site'
import { siteUrls } from '@n3wth/site-config'
import { SiteNav } from './SiteNav'
import { CodeSnippet } from './sections/CodeSnippet'
import { SEO, JsonLdWebSite } from './SEO'

const layers = [
  { name: 'Sites', path: 'apps/*', responsibility: 'Content, routes and product logic', detail: 'Choose what the site says and does. Pass your router links and actions into shared components.' },
  { name: '@n3wth/ui', path: 'packages/ui', responsibility: 'One brand and shared page structure', detail: 'Own the Newth theme, fonts, navigation, heroes, sections and footer. Translate existing component APIs when compatibility is needed.' },
  { name: 'Astryx', path: '@astryxdesign/core', responsibility: 'Primitives and interaction behavior', detail: 'Supply the underlying controls, semantics and interaction patterns. The UI package exposes their native API through its primitives entry point.' },
]

export function SystemHome() {
  const [count, setCount] = useState(0)
  return <>
    <SEO title="@n3wth/ui — The Newth site system" description="How Newth sites use a shared brand and page system built on Astryx primitives." path="/" />
    <JsonLdWebSite />
    <SiteNav />
    <SiteContainer as="main" id="main-content" className="n3wth-site-main">
      <PageHeader title="The Newth site system" description="Sites own the content. UI owns the brand and page structure. Astryx provides the primitives underneath." actions={<><Link to="/docs/getting-started">Build a site</Link><Link to="/components">Explore components</Link></>} />
      <SiteSection aria-labelledby="architecture">
        <SiteHeading id="architecture">Three layers, clear ownership</SiteHeading>
        <SiteText className="system-intro">Dependencies flow down: Sites → @n3wth/ui → Astryx. A shared change belongs in the lowest layer that owns it.</SiteText>
        <ol className="system-layers">
          {layers.map((layer, index) => <li key={layer.name}>
            <SiteText variant="supporting">0{index + 1} · {layer.path}</SiteText>
            <SiteHeading variant="item">{layer.name}</SiteHeading>
            <SiteText>{layer.responsibility}</SiteText>
            <SiteText variant="supporting">{layer.detail}</SiteText>
          </li>)}
        </ol>
      </SiteSection>
      <SiteSection aria-labelledby="imports">
        <SiteHeading id="imports">Choose the right entry point</SiteHeading>
        <div className="system-table-wrap"><table className="system-table">
          <thead><tr><th scope="col">You need</th><th scope="col">Import</th><th scope="col">Owner</th></tr></thead>
          <tbody>
            <tr><th scope="row">A consistent page</th><td><code>@n3wth/ui/site</code></td><td>UI</td></tr>
            <tr><th scope="row">A native control</th><td><code>@n3wth/ui/primitives</code></td><td>Astryx API, exposed by UI</td></tr>
            <tr><th scope="row">Theme and fonts</th><td><code>@n3wth/ui/site.css</code></td><td>UI</td></tr>
            <tr><th scope="row">Tailwind theme bridge</th><td><code>@n3wth/ui/tailwind-theme.css</code></td><td>Astryx tokens, exposed by UI</td></tr>
            <tr><th scope="row">An existing component API</th><td><code>@n3wth/ui</code></td><td>UI compatibility layer</td></tr>
          </tbody>
        </table></div>
        <SiteText variant="supporting">These paths describe the current workspace. Check a published package’s exports before using them outside this repository.</SiteText>
      </SiteSection>
      <SiteSection aria-labelledby="compose">
        <SiteHeading id="compose">Compose a page once</SiteHeading>
        <SiteText className="system-intro">This site uses the same navigation, page header, sections and footer as the rest of the family. Start from those components and add your content.</SiteText>
        <CodeSnippet code={`import {
  N3wthProvider, SiteNavigation, SiteContainer,
  PageHeader, SiteSection, SiteHeading, SiteText, SiteFooter,
} from '@n3wth/ui/site'
import '@n3wth/ui/site.css'

export function App() {
  return <N3wthProvider mode="dark">
    <SiteNavigation brand={<a href="/">My site</a>}
      links={<a href="#work">Work</a>} />
    <SiteContainer as="main" className="n3wth-site-main">
      <PageHeader title="A useful idea" description="What it helps people do." />
      <SiteSection id="work">
        <SiteHeading>How it works</SiteHeading>
        <SiteText>Your content goes here.</SiteText>
      </SiteSection>
    </SiteContainer>
    <SiteFooter />
  </N3wthProvider>
}`} />
      </SiteSection>
      <SiteSection aria-labelledby="primitive">
        <SiteHeading id="primitive">Astryx behavior, shared brand</SiteHeading>
        <SiteText className="system-intro">This control is imported from the primitives facade. Its click state belongs to this page; its control implementation comes from Astryx and its appearance uses the Newth theme.</SiteText>
        <div className="system-primitive-demo">
          <Button onClick={() => setCount(value => value + 1)}>Try the primitive</Button>
          <SiteText variant="supporting" role="status" aria-label="Primitive activation">Activated {count} {count === 1 ? 'time' : 'times'}</SiteText>
        </div>
        <CodeSnippet code={`import { Button } from '@n3wth/ui/primitives'

<Button onClick={() => setCount(value => value + 1)}>
  Try the primitive
</Button>`} />
      </SiteSection>
      <SiteSection aria-labelledby="changes">
        <SiteHeading id="changes">Make the change where it belongs</SiteHeading>
        <ul className="system-guidance">
          <li><strong>A new idea or route:</strong> change the site. Keep navigation links and product state there.</li>
          <li><strong>A font, spacing or page pattern:</strong> change UI, then check every consuming site.</li>
          <li><strong>A control’s keyboard behavior:</strong> use the Astryx primitive. Keep compatibility mapping in UI, rather than duplicating the behavior in an app.</li>
        </ul>
        <div className="n3wth-site-actions"><Link to="/docs/theming">Theme and typography</Link><Link to="/docs/components">Component boundaries</Link></div>
      </SiteSection>
    </SiteContainer>
    <SiteFooter sourceHref="https://github.com/n3wth/n3wth/tree/main/packages/ui" legalLinks={<a href={`${siteUrls.home}/privacy`}>Privacy</a>} />
  </>
}
