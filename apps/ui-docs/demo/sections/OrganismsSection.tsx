import { DemoSection, DemoBlock } from './DemoSection'
import { CodeSnippet } from './CodeSnippet'

export function OrganismsSection() {
  return <DemoSection id="organisms" title="Site patterns" description="Page structure belongs to the shared UI layer. The live shell uses these components.">
    <DemoBlock title="Navigation and footer"><CodeSnippet code={`import { SiteNavigation, SiteFooter } from '@n3wth/ui/site'

<SiteNavigation brand={<a href="/">My site</a>}
  links={<a href="/work">Work</a>} />
<SiteFooter sourceHref="https://github.com/n3wth/n3wth" />`} /></DemoBlock>
    <DemoBlock title="Hero and sections"><CodeSnippet code={`import { PageHeader, SiteSection, SiteHeading, SiteText } from '@n3wth/ui/site'

<PageHeader title="Work" description="Selected projects."
  actions={<a href="/resume.pdf">Resume (PDF)</a>} />
<SiteSection>
  <SiteHeading>Projects</SiteHeading>
  <SiteText>What each project helps people do.</SiteText>
</SiteSection>`} /></DemoBlock>
  </DemoSection>
}
