import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader, SiteContainer, SiteHeading, SiteText } from '@n3wth/ui/site'
import { InstallCommand } from './_components/install-command'
import { ComponentShowcase } from './_components/component-showcase'
import { Footer } from './_components/footer'

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
  description: 'A shadcn component registry with AI context packs. Install components via npx shadcn add, then drop in GEMINI.md so AI tools generate code that uses them correctly.',
  isPartOf: { '@id': 'https://kit.n3wth.com/#website' },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: 'https://kit.n3wth.com/opengraph-image',
  },
}

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      {/* Hero */}
      <SiteContainer as="section" className="pt-24 pb-14">
        <div className="grid grid-cols-1 items-center gap-12 sm:grid-cols-2">
          <div>
            <PageHeader
              style={{ flexDirection: 'column', alignItems: 'stretch', paddingBlock: 0 }}
              title={<>shadcn registry<br />+ AI context packs</>}
              description={<>
              Install components with{' '}
              <code className="rounded bg-bg-raise px-1.5 py-0.5 font-mono text-sm">npx shadcn add</code>.
              Drop in the <code className="rounded bg-bg-raise px-1.5 py-0.5 font-mono text-sm">GEMINI.md</code>{' '}
              context pack to give Antigravity CLI the component guidance.
              </>}
              actions={<InstallCommand command="npx shadcn add https://kit.n3wth.com/r/button.json" />}
            />
          </div>

          {/* Code comparison */}
          <div className="grid gap-px overflow-hidden rounded-lg border border-rail-strong bg-rail-strong">
            <div className="bg-bg-raise p-5">
              <div className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
                <SiteText variant="supporting">Without context</SiteText>
              </div>
              <pre className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-ink-faint">
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
              <pre className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-ink">
{`<Button
  variant="primary"
  size="lg">
  Get Started
</Button>`}
              </pre>
            </div>
          </div>
        </div>
      </SiteContainer>

      {/* What's a context pack */}
      <section className="border-t border-rail">
        <div className="n3wth-site-container py-14">
          <SiteHeading variant="section" level={2}>
            What&apos;s a context pack?
          </SiteHeading>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-dim">
            A context pack is a file you drop into your project that tells AI coding tools
            about your components. Antigravity CLI reads{' '}
            <code className="rounded bg-bg-raise px-1.5 py-0.5 font-mono text-xs">GEMINI.md</code>.
            Merge the guidance with your existing instructions and review generated changes.
          </p>
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
        </div>
      </section>

      {/* Components */}
      <section className="border-t border-rail">
        <div className="n3wth-site-container py-14">
          <SiteHeading variant="section" level={2} className="max-w-3xl">
            The registry
          </SiteHeading>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-dim">
            32 UI components, 4 blocks, 11 hooks. Each installs with{' '}
            <code className="rounded bg-bg-raise px-1.5 py-0.5 font-mono text-xs">npx shadcn add</code>{' '}
            and is documented in the context packs.
          </p>
          <div className="mt-10">
            <ComponentShowcase />
          </div>
          <p className="mt-6 text-sm text-ink-dim">
            <Link href="/components" className="underline underline-offset-4 hover:text-ink">
              View all components →
            </Link>
          </p>
        </div>
      </section>

      {/* Install */}
      <section className="border-t border-rail">
        <div className="n3wth-site-container py-14">
          <SiteHeading variant="section" level={2}>
            Get started
          </SiteHeading>

          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <SiteText variant="supporting">1. Install components</SiteText>
              <p className="mt-2 text-sm text-ink-dim">
                The standard shadcn CLI copies each component into your project.
              </p>
              <div className="mt-4">
                <InstallCommand command="npx shadcn add https://kit.n3wth.com/r/button.json" />
              </div>
            </div>

            <div>
              <SiteText variant="supporting">2. Add context pack</SiteText>
              <p className="mt-2 text-sm text-ink-dim">
                Download the file for your AI tool. It teaches the tool how to use the components.
              </p>
              <div className="mt-4">
                <InstallCommand command="curl -o GEMINI.md https://kit.n3wth.com/ai/GEMINI.md" />
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm text-ink-dim">
            <Link href="/docs/getting-started" className="underline underline-offset-4 hover:text-ink">
              Full setup guide →
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
