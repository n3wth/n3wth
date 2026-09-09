import type { Metadata } from 'next'
import Link from 'next/link'
import {
  PageHeader,
  SiteContainer,
  SiteHeading,
  SiteSection,
  SiteText,
} from '@n3wth/ui/site'
import { InstallCommand } from './_components/install-command'
import { ComponentShowcase } from './_components/component-showcase'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://kit.n3wth.com',
  },
}

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://kit.n3wth.com/#webpage',
  url: 'https://kit.n3wth.com',
  name: 'n3wth/kit — shadcn registry with AI context packs',
  description:
    'A shadcn component registry with AI context packs. Install components via npx shadcn add, then drop in GEMINI.md so AI tools generate code that uses them correctly.',
  isPartOf: { '@id': 'https://kit.n3wth.com/#website' },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: 'https://kit.n3wth.com/opengraph-image',
  },
}

export default function Home() {
  return (
    <main className="n3wth-site-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      {/* Hero */}
      <SiteContainer>
        <PageHeader
          title={
            <>
              shadcn registry
              <br />+ AI context packs
            </>
          }
          description={
            <>
              Install components with{' '}
              <code className="rounded bg-bg-raise px-1.5 py-0.5 font-mono text-sm">
                npx shadcn add
              </code>
              . Drop in the{' '}
              <code className="rounded bg-bg-raise px-1.5 py-0.5 font-mono text-sm">
                GEMINI.md
              </code>{' '}
              context pack to give Antigravity CLI the component guidance.
            </>
          }
          actions={
            <InstallCommand command="npx shadcn add https://kit.n3wth.com/r/button.json" />
          }
          aside={
            <div className="grid gap-px overflow-hidden rounded-lg border border-rail-strong bg-rail-strong">
              <div className="bg-bg-raise p-5">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
                  <SiteText variant="supporting">Without context</SiteText>
                </div>
                <pre className="mt-6 overflow-x-auto font-mono text-xs leading-relaxed text-ink-faint">
                  {`<button className="bg-primary
  text-primary-foreground
  hover:bg-primary/90
  h-10 px-4 py-2 rounded-md
  text-sm font-medium">
  Get Started
</button>`}
                </pre>
              </div>
              <div className="bg-bg-raise p-5">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <SiteText variant="supporting">With context pack</SiteText>
                </div>
                <pre className="mt-6 overflow-x-auto font-mono text-xs leading-relaxed text-ink">
                  {`<Button
  variant="primary"
  size="lg">
  Get Started
</Button>`}
                </pre>
              </div>
            </div>
          }
        />
      </SiteContainer>

      {/* What's a context pack */}
      <SiteSection className="border-t border-rail">
        <SiteContainer>
          <SiteHeading variant="section" level={2}>
            What&apos;s a context pack?
          </SiteHeading>
          <SiteText className="mt-6">
            A context pack is a file you drop into your project that tells AI
            coding tools about your components. Antigravity CLI reads{' '}
            <code className="rounded bg-bg-raise px-1.5 py-0.5 font-mono text-xs">
              GEMINI.md
            </code>
            . Merge the guidance with your existing instructions and review
            generated changes.
          </SiteText>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/ai/GEMINI.md"
              className="inline-flex items-center gap-2 rounded-md border border-rail px-3 py-1.5 text-xs font-medium text-ink-dim transition-colors hover:border-rail-strong hover:text-ink"
            >
              <span>GEMINI.md</span>
            </a>
            <a
              href="/ai/AGENTS.md"
              className="inline-flex items-center gap-2 rounded-md border border-rail px-3 py-1.5 text-xs font-medium text-ink-dim transition-colors hover:border-rail-strong hover:text-ink"
            >
              <span>AGENTS.md</span>
            </a>
            <a
              href="/ai/mcp.json"
              className="inline-flex items-center gap-2 rounded-md border border-rail px-3 py-1.5 text-xs font-medium text-ink-dim transition-colors hover:border-rail-strong hover:text-ink"
            >
              <span>mcp.json</span>
            </a>
          </div>
        </SiteContainer>
      </SiteSection>

      {/* Components */}
      <SiteSection className="border-t border-rail">
        <SiteContainer>
          <SiteHeading variant="section" level={2} className="max-w-3xl">
            The registry
          </SiteHeading>
          <SiteText className="mt-6">
            32 UI components, 4 blocks, 11 hooks. Each installs with{' '}
            <code className="rounded bg-bg-raise px-1.5 py-0.5 font-mono text-xs">
              npx shadcn add
            </code>{' '}
            and is documented in the context packs.
          </SiteText>
          <div className="mt-6">
            <ComponentShowcase />
          </div>
          <SiteText className="mt-6">
            <Link
              href="/components"
              className="underline underline-offset-4 hover:text-ink"
            >
              View all components →
            </Link>
          </SiteText>
        </SiteContainer>
      </SiteSection>

      {/* Install */}
      <SiteSection className="border-t border-rail">
        <SiteContainer>
          <SiteHeading variant="section" level={2}>
            Get started
          </SiteHeading>

          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <SiteText variant="supporting">1. Install components</SiteText>
              <SiteText className="mt-2">
                The standard shadcn CLI copies each component into your project.
              </SiteText>
              <div className="mt-4">
                <InstallCommand command="npx shadcn add https://kit.n3wth.com/r/button.json" />
              </div>
            </div>

            <div>
              <SiteText variant="supporting">2. Add context pack</SiteText>
              <SiteText className="mt-2">
                Download the file for your AI tool. It teaches the tool how to
                use the components.
              </SiteText>
              <div className="mt-4">
                <InstallCommand command="curl -o GEMINI.md https://kit.n3wth.com/ai/GEMINI.md" />
              </div>
            </div>
          </div>

          <SiteText className="mt-6">
            <Link
              href="/docs/getting-started"
              className="underline underline-offset-4 hover:text-ink"
            >
              Full setup guide →
            </Link>
          </SiteText>
        </SiteContainer>
      </SiteSection>
    </main>
  )
}
