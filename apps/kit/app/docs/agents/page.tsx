import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Context Pack',
  description: 'Set up n3wth/kit with AGENTS.md. Configure the AI context pack and MCP server to generate on-brand components.',
  alternates: {
    canonical: 'https://kit.n3wth.com/docs/agents',
  },
  openGraph: {
    title: 'AI Context Pack — n3wth/kit',
    description: 'Set up AGENTS.md and MCP server for AI coding tools.',
    url: 'https://kit.n3wth.com/docs/agents',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Context Pack — n3wth/kit',
    description: 'Set up AGENTS.md and MCP server for AI coding tools.',
  },
}

export default function AgentsDocsPage() {
  return (
    <div className="min-h-screen bg-bg">
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          AI Context Pack
        </h1>
        <p className="mt-3 text-ink-dim">
          Configure AI coding tools to use n3wth/kit components with full design
          system context.
        </p>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-ink">Prerequisites</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-ink-dim">
            <li>An AI coding tool (Cursor, Windsurf, or similar)</li>
            <li>A React/Next.js project with shadcn/ui initialized</li>
            <li>Tailwind CSS v4</li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-ink">
            1. Add the AGENTS.md file
          </h2>
          <p className="mt-3 text-sm text-ink-dim">
            Download the context file to your project root. AI tools read
            AGENTS.md automatically and gain full knowledge of your components.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim">
            curl -o AGENTS.md https://kit.n3wth.com/ai/AGENTS.md
          </pre>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-ink">
            2. Configure the MCP server
          </h2>
          <p className="mt-3 text-sm text-ink-dim">
            Create or edit{' '}
            <code className="rounded bg-bg-raise px-1.5 py-0.5 font-mono text-xs text-ink-dim">
              .mcp.json
            </code>{' '}
            in your project root:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim">
{`{
  "mcpServers": {
    "n3wth-kit": {
      "command": "npx",
      "args": ["-y", "shadcn@latest", "registry:mcp"],
      "env": {
        "REGISTRY_URL": "https://kit.n3wth.com/r/registry.json"
      }
    }
  }
}`}
          </pre>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-ink">
            3. Install components
          </h2>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim">
{`npx shadcn add https://kit.n3wth.com/r/button.json
npx shadcn add https://kit.n3wth.com/r/card.json`}
          </pre>
          <p className="mt-3 text-sm text-ink-dim">
            Or tell your AI tool: &quot;Install the card component from
            kit.n3wth.com&quot;. It will run the command for you.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-ink">
            4. Usage examples
          </h2>
          <div className="mt-4 space-y-3">
            <pre className="overflow-x-auto rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim">
              Build a settings page using the n3wth design system
            </pre>
            <pre className="overflow-x-auto rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim">
              Add a pricing section with Card components and semantic colors
            </pre>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-ink">Tips</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-ink-dim">
            <li>Commit AGENTS.md to your repo so everyone gets the same AI context</li>
            <li>Reference component names directly for unambiguous results</li>
            <li>Use the MCP server for live registry access during sessions</li>
          </ul>
        </section>
      </main>
    </div>
  )
}
