import type { Metadata } from 'next'
import Link from 'next/link'
import { PageViewTracker } from '../../_components/page-view-tracker'

export const metadata: Metadata = {
  title: 'Getting Started',
  description: 'Get started with n3wth/kit. Install components via shadcn CLI, configure context packs for Cursor, Windsurf, and v0.',
  alternates: {
    canonical: 'https://kit.n3wth.com/docs/getting-started',
  },
  openGraph: {
    title: 'Getting Started — n3wth/kit',
    description: 'Install components via shadcn CLI and configure AI context packs.',
    url: 'https://kit.n3wth.com/docs/getting-started',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Getting Started — n3wth/kit',
    description: 'Install components via shadcn CLI and configure AI context packs.',
  },
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim leading-relaxed">
      {children}
    </pre>
  )
}

function InlineCode({ children }: { children: string }) {
  return (
    <code className="rounded bg-bg-raise px-1.5 py-0.5 font-mono text-xs text-ink-dim">
      {children}
    </code>
  )
}

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-bg">
      <PageViewTracker event="docs_page_viewed" properties={{ page: 'getting-started' }} />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
        <div className="mb-2 text-sm text-ink-faint">
          <Link href="/docs" className="hover:text-ink-dim transition-colors">Docs</Link>
          {' / '}
          <span>Getting Started</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Getting Started
        </h1>
        <p className="mt-3 text-ink-dim">
          Add n3wth/kit components to your project and configure AI tools to generate on-brand code.
        </p>

        {/* Prerequisites */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-ink">Prerequisites</h2>
          <p className="mt-3 text-sm text-ink-dim">
            You need an existing React or Next.js project with the following set up:
          </p>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-ink-dim">
            <li>
              Node.js 18+
            </li>
            <li>
              A Next.js or React project
            </li>
            <li>
              Tailwind CSS v4 (uses <InlineCode>@import "tailwindcss"</InlineCode> syntax)
            </li>
            <li>
              shadcn/ui initialized — run <InlineCode>npx shadcn init</InlineCode> if not yet set up
            </li>
          </ul>

          <div className="mt-6">
            <p className="text-sm font-medium text-ink-dim">New project from scratch:</p>
            <CodeBlock>{`npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
npx shadcn init`}</CodeBlock>
          </div>
        </section>

        {/* Install the design system style */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-ink">
            1. Install the n3wth style
          </h2>
          <p className="mt-3 text-sm text-ink-dim">
            Start by installing the base style. This sets up the design tokens — colors, typography, and border radius — used by all n3wth components.
          </p>
          <CodeBlock>{'npx shadcn add https://kit.n3wth.com/r/n3wth.json'}</CodeBlock>
          <p className="mt-3 text-sm text-ink-dim">
            This updates your <InlineCode>globals.css</InlineCode> with CSS variables for the full n3wth color palette and adds the <InlineCode>cn</InlineCode> utility.
          </p>
        </section>

        {/* Install components */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-ink">
            2. Install components
          </h2>
          <p className="mt-3 text-sm text-ink-dim">
            Use the shadcn CLI to add individual components from the registry. Each component is copied directly into your project so you own and can modify the source.
          </p>
          <CodeBlock>{`npx shadcn add https://kit.n3wth.com/r/button.json
npx shadcn add https://kit.n3wth.com/r/card.json
npx shadcn add https://kit.n3wth.com/r/input.json`}</CodeBlock>
          <p className="mt-3 text-sm text-ink-dim">
            Components are installed to <InlineCode>components/ui/</InlineCode> by default. See the{' '}
            <Link href="/components" className="text-ink underline underline-offset-4">
              component gallery
            </Link>{' '}
            for all available components and their install commands.
          </p>
        </section>

        {/* First component usage */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-ink">
            3. Use your first component
          </h2>
          <p className="mt-3 text-sm text-ink-dim">
            Import and use components like any React component:
          </p>
          <CodeBlock>{`import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Get started</Button>
        <Button variant="secondary">Learn more</Button>
      </CardContent>
    </Card>
  )
}`}</CodeBlock>

          <div className="mt-6">
            <p className="text-sm font-medium text-ink-dim">Button variants:</p>
            <CodeBlock>{`<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button isLoading>Loading...</Button>`}</CodeBlock>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-ink-dim">Input with icon:</p>
            <CodeBlock>{`import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

<Input
  placeholder="Search..."
  leftIcon={<Search className="h-4 w-4" />}
/>
<Input
  placeholder="Email"
  type="email"
  error="Please enter a valid email"
/>`}</CodeBlock>
          </div>
        </section>

        {/* AI Context Packs */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-ink">
            4. Set up AI context packs
          </h2>
          <p className="mt-3 text-sm text-ink-dim">
            Context packs teach your AI coding tool about the n3wth design system. With them loaded, generated code uses your components correctly — right variants, right props, right patterns.
          </p>

          <div className="mt-8 space-y-8">
            {/* Cursor */}
            <div>
              <h3 className="text-base font-semibold text-ink">Cursor</h3>
              <p className="mt-2 text-sm text-ink-dim">
                Add the <InlineCode>.cursorrules</InlineCode> file to your project root:
              </p>
              <CodeBlock>{'curl -o .cursorrules https://kit.n3wth.com/ai/cursorrules'}</CodeBlock>
              <p className="mt-3 text-sm text-ink-dim">
                Commit this file so your whole team gets the same AI context. See the{' '}
                <Link href="/docs/cursor" className="text-ink underline underline-offset-4">
                  Cursor integration guide
                </Link>
                {' '}for MCP setup.
              </p>
            </div>

            {/* AGENTS.md */}
            <div>
              <h3 className="text-base font-semibold text-ink">AGENTS.md</h3>
              <p className="mt-2 text-sm text-ink-dim">
                Download the <InlineCode>AGENTS.md</InlineCode> context file:
              </p>
              <CodeBlock>{'curl -o AGENTS.md https://kit.n3wth.com/ai/AGENTS.md'}</CodeBlock>
              <p className="mt-3 text-sm text-ink-dim">
                AI coding tools read <InlineCode>AGENTS.md</InlineCode> automatically at startup. See the{' '}
                <Link href="/docs/agents" className="text-ink underline underline-offset-4">
                  AI context pack guide
                </Link>
                {' '}for MCP setup.
              </p>
            </div>

            {/* v0 */}
            <div>
              <h3 className="text-base font-semibold text-ink">v0</h3>
              <p className="mt-2 text-sm text-ink-dim">
                Point v0 at the registry URL in your prompts:
              </p>
              <CodeBlock>{'Use components from https://kit.n3wth.com/r — build a settings page with Card and Input'}</CodeBlock>
              <p className="mt-3 text-sm text-ink-dim">
                See the{' '}
                <Link href="/docs/v0" className="text-ink underline underline-offset-4">
                  v0 integration guide
                </Link>
                {' '}for full details.
              </p>
            </div>
          </div>
        </section>

        {/* Registry URL reference */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-ink">Registry URL</h2>
          <p className="mt-3 text-sm text-ink-dim">
            All components are available at:
          </p>
          <CodeBlock>{'https://kit.n3wth.com/r'}</CodeBlock>
          <p className="mt-3 text-sm text-ink-dim">
            Append <InlineCode>{`<name>.json`}</InlineCode> for a specific component:{' '}
            <InlineCode>https://kit.n3wth.com/r/badge.json</InlineCode>
          </p>
          <p className="mt-3 text-sm text-ink-dim">
            Full registry manifest: <InlineCode>https://kit.n3wth.com/r/registry.json</InlineCode>
          </p>
        </section>

        {/* Troubleshooting */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-ink">Troubleshooting</h2>

          <div className="mt-6 space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                &ldquo;Cannot find module @/components/ui/button&rdquo;
              </h3>
              <p className="mt-2 text-sm text-ink-dim">
                Make sure you have a path alias configured. In <InlineCode>tsconfig.json</InlineCode>:
              </p>
              <CodeBlock>{`{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}`}</CodeBlock>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">
                Styles not applying
              </h3>
              <p className="mt-2 text-sm text-ink-dim">
                n3wth/kit requires Tailwind CSS v4. Check your <InlineCode>globals.css</InlineCode> starts with:
              </p>
              <CodeBlock>{'@import "tailwindcss";'}</CodeBlock>
              <p className="mt-3 text-sm text-ink-dim">
                If you see <InlineCode>@tailwind base</InlineCode> directives instead, you are on Tailwind v3. See the{' '}
                <a
                  href="https://tailwindcss.com/docs/upgrade-guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-4"
                >
                  Tailwind v4 upgrade guide
                </a>
                .
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">
                shadcn prompts to overwrite existing components
              </h3>
              <p className="mt-2 text-sm text-ink-dim">
                If you have existing shadcn components, you will be prompted before any file is overwritten. Review the diff before confirming — n3wth components use different variant names and props from default shadcn components.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">
                &ldquo;Could not resolve registry&rdquo;
              </h3>
              <p className="mt-2 text-sm text-ink-dim">
                Verify the registry is reachable. If kit.n3wth.com is down, check{' '}
                <a
                  href="https://github.com/n3wth/kit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-4"
                >
                  github.com/n3wth/kit
                </a>
                {' '}and install directly from the source.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">
                Peer dependency warnings
              </h3>
              <p className="mt-2 text-sm text-ink-dim">
                Some components depend on <InlineCode>lucide-react</InlineCode> and <InlineCode>class-variance-authority</InlineCode>. Install them if needed:
              </p>
              <CodeBlock>{'npm install lucide-react class-variance-authority clsx tailwind-merge'}</CodeBlock>
            </div>
          </div>
        </section>

        {/* Next steps */}
        <section className="mt-12 border-t border-rail pt-12">
          <h2 className="text-lg font-semibold text-ink">Next steps</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              {
                title: 'Browse components',
                href: '/components',
                description: 'See all components with install commands.',
              },
              {
                title: 'Cursor integration',
                href: '/docs/cursor',
                description: 'Full .cursorrules and MCP setup guide.',
              },
              {
                title: 'AI Context Pack',
                href: '/docs/agents',
                description: 'AGENTS.md and MCP server configuration.',
              },
              {
                title: 'v0 integration',
                href: '/docs/v0',
                description: 'Generate on-brand UIs with v0.',
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group block rounded-lg border border-rail p-4 transition-colors hover:border-rail-strong"
              >
                <p className="text-sm font-semibold text-ink group-hover:text-ink-dim transition-colors">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-ink-dim">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
