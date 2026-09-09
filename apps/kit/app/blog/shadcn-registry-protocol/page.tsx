import { CodeBlock } from '@n3wth/ui'
import { SiteHeading } from '@n3wth/ui/site'
import type { Metadata } from 'next'
import { PostLayout } from '../_components/post-layout'

export const metadata: Metadata = {
  title: 'The shadcn Registry Protocol',
  description: 'How the shadcn registry protocol works.',
  alternates: {
    canonical: 'https://kit.n3wth.com/blog/shadcn-registry-protocol',
  },
  openGraph: {
    title: 'The shadcn Registry Protocol — n3wth/kit',
    description: 'How the shadcn registry protocol works.',
    url: 'https://kit.n3wth.com/blog/shadcn-registry-protocol',
    type: 'article',
    publishedTime: '2026-02-12T00:00:00Z',
    authors: ['Oliver Newth'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The shadcn Registry Protocol — n3wth/kit',
    description: 'How the shadcn registry protocol works.',
  },
}

export default function Post() {
  return (
    <PostLayout
      title="The shadcn Registry Protocol"
      date="February 12, 2026"
      readingTime="4 min read"
    >
      <p>
        The shadcn/ui registry protocol is one of the most underappreciated
        innovations in the React ecosystem. It solves a fundamental problem with
        component libraries: how do you distribute components as source code
        instead of compiled packages?
      </p>

      <SiteHeading variant="section" level={2} className="mt-12">
        The problem with npm packages
      </SiteHeading>

      <p>
        Traditional component libraries ship as npm packages. You install them,
        import them, and use them as black boxes. This works until you need to
        customize something beyond what the API exposes. Then you are fighting
        the library &mdash; overriding styles, wrapping components, or forking the
        entire package.
      </p>

      <p>
        shadcn/ui took a different approach: instead of installing a package,
        you copy the component source code into your project. You own it. You
        can modify it however you want. But copying files manually does not
        scale, which is where the registry protocol comes in.
      </p>

      <SiteHeading variant="section" level={2} className="mt-12">
        How the protocol works
      </SiteHeading>

      <p>
        The registry protocol is a JSON-based schema that describes components
        and their dependencies. Each component is represented as a registry
        item &mdash; a JSON file that the CLI can fetch and process.
      </p>

      <div className="min-w-0">
        <CodeBlock size="sm" language="json" showCopyButton code={`{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "pricing-card",
  "type": "registry:component",
  "title": "Pricing Card",
  "description": "A pricing tier card component.",
  "dependencies": ["clsx"],
  "registryDependencies": ["button"],
  "files": [
    {
      "path": "registry/new-york/pricing-card.tsx",
      "type": "registry:component",
      "content": "// full component source code"
    }
  ]
}`} />
      </div>

      <SiteHeading variant="section" level={2} className="mt-12">
        The install flow
      </SiteHeading>

      <p>
        When you run the install command, the CLI performs a straightforward
        sequence:
      </p>

      <div className="min-w-0">
        <CodeBlock size="sm" language="bash" showCopyButton code={`npx shadcn add https://kit.n3wth.com/r/card.json`} />
      </div>

      <ol className="list-inside list-decimal space-y-2">
        <li>Fetch the registry JSON from the URL</li>
        <li>Resolve registryDependencies recursively</li>
        <li>Install any npm dependencies not already in the project</li>
        <li>Write the source files to the configured component directory</li>
      </ol>

      <p>
        The result is source code in your project that you fully own. No runtime
        dependency on the registry. No version lock-in. Just files.
      </p>

      <SiteHeading variant="section" level={2} className="mt-12">
        Why this matters for the ecosystem
      </SiteHeading>

      <p>
        The registry protocol turns component distribution into a URL-based
        concern. Anyone can host a registry. You do not need to publish to npm.
        You just need a web server that serves JSON files.
      </p>

      <ul className="list-inside list-disc space-y-2">
        <li>
          <span className="text-ink">Teams can run private registries</span> &mdash;
          internal component libraries distributed via the same protocol
        </li>
        <li>
          <span className="text-ink">Composition over inheritance</span> &mdash;
          registries can depend on other registries
        </li>
        <li>
          <span className="text-ink">No version conflicts</span> &mdash;
          you own the source, so there are no peer dependency issues
        </li>
      </ul>

      <SiteHeading variant="section" level={2} className="mt-12">
        Extending with AI context
      </SiteHeading>

      <p>
        The registry protocol gives you component distribution. But
        distribution alone is not enough when AI tools are generating half your
        code. The tool that writes your components needs to understand how to
        use them.
      </p>

      <p>
        This is where kit extends the protocol. Alongside each component in the
        registry, kit ships AI context packs &mdash; structured descriptions of
        component APIs, composition patterns, and design constraints that AI
        tools can consume.
      </p>

      <div className="min-w-0">
        <CodeBlock size="sm" language="text" showCopyButton code={`# Install the component
npx shadcn add https://kit.n3wth.com/r/button.json

# AI tools now know about Button:
# - Available props: variant, size, disabled
# - Variants: primary, secondary, ghost, outline
# - Constraints: use primary for main CTA only`} />
      </div>

      <p>
        The registry protocol created the foundation for source-code component
        distribution. The next step is making that distribution AI-aware. That
        is what we are building.
      </p>

      <div className="mt-12 rounded-lg border border-rail bg-bg-soft p-6">
        <p className="text-ink">
          kit uses the shadcn registry protocol to distribute components with
          context packs. Install with a single command, get source code you own,
          and context that teaches your tools how to use it.
        </p>
        <a
          href="/docs/getting-started"
          className="mt-4 inline-block text-sm text-ink underline underline-offset-4"
        >
          Read the docs to get started
        </a>
      </div>
    </PostLayout>
  )
}
