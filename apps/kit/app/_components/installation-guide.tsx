import { PageHeader, SiteContainer, SiteSection, SiteHeading } from '@n3wth/ui/site'

export function InstallationGuide({ title }: { title: string }) {
  return (
    <SiteContainer as="main" className="n3wth-site-main">
      <PageHeader title={title} />
      <SiteSection>
      <SiteHeading variant="section" level={2} className="mt-10">Install a component</SiteHeading>
      <pre className="mt-4 overflow-x-auto text-sm">npx shadcn add https://kit.n3wth.com/r/button.json</pre>
      <SiteHeading variant="section" level={2} className="mt-10">Add project context</SiteHeading>
      <p className="mt-4 text-ink-dim">Download the context file and merge its component guidance into your existing GEMINI.md. Keep your project instructions. Antigravity CLI loads this file as project context.</p>
      <a className="mt-4 inline-block text-ink" href="/ai/GEMINI.md">Download GEMINI.md</a>
      <p className="mt-4 text-ink-dim">Review generated code and run your project checks before shipping changes.</p>
      <a className="mt-4 inline-block text-ink" href="https://antigravity.google/docs/rules-workflows/">Antigravity CLI context documentation</a>
    </SiteSection>
    </SiteContainer>
  )
}
