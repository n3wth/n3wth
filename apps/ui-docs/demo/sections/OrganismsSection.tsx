import { DemoSection, DemoBlock } from './DemoSection'
import { CodeSnippet } from './CodeSnippet'
import { AssembleField, VisualBand } from '@n3wth/ui/visuals'

const clusters: [number, number][] = [[530, 132], [645, 284], [762, 158], [850, 262]]

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
    <DemoBlock title="Decorative visual bands">
      <VisualBand fullBleed={false} height={220}>
        <AssembleField seed={4} cols={30} rows={12} width={900} height={400} clusters={clusters} />
      </VisualBand>
      <CodeSnippet code={`import { AssembleField, VisualBand } from '@n3wth/ui/visuals'
import '@n3wth/ui/site.css'

<VisualBand height="clamp(190px, 34svh, 340px)">
  <AssembleField clusters={[[530, 132], [645, 284], [762, 158]]}
    width={900} height={400} />
</VisualBand>`} />
    </DemoBlock>
  </DemoSection>
}
