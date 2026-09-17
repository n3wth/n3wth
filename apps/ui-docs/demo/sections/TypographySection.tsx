import { SiteHeading, SiteText } from '@n3wth/ui/site'
import { DemoSection } from './DemoSection'
import { CodeSnippet } from './CodeSnippet'

export function TypographySection() {
  return <DemoSection id="typography" title="Typography" description="Suisse Intl gives headings their shape and keeps reading and controls clear; Geist Mono is reserved for code.">
    <div className="docs-type-grid">
      <div className="docs-type-specimen">
        <SiteText variant="supporting">Headings · Suisse Intl</SiteText>
        <div><SiteHeading variant="page" level={3}>A useful idea</SiteHeading></div>
        <div><SiteHeading variant="section" level={3}>How it works</SiteHeading></div>
        <div><SiteHeading variant="item" level={3}>The details</SiteHeading></div>
        <SiteText variant="supporting">Page, section and item roles. Choose the heading level for the document structure, independently of its visual size.</SiteText>
      </div>
      <div className="docs-type-specimen">
        <SiteText variant="supporting">Reading and controls · Suisse Intl</SiteText>
        <SiteText>Good documentation makes the next step clear. Use body text for explanations and supporting text for context that can stay quieter.</SiteText>
        <SiteText variant="supporting">Supporting text uses the same family, with less visual emphasis.</SiteText>
        <div><SiteText variant="supporting">Code · Geist Mono</SiteText></div>
        <CodeSnippet code={`<SiteHeading variant="section">How it works</SiteHeading>
<SiteText>Your content goes here.</SiteText>`} />
      </div>
    </div>
  </DemoSection>
}
