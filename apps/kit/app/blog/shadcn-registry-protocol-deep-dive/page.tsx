import type { Metadata } from 'next'
import { PostLayout } from '../_components/post-layout'

export const metadata: Metadata = {
  title: 'The shadcn Registry Protocol: A Technical Deep Dive',
  description: 'How the shadcn registry protocol works under the hood: JSON schema, install flow, dependency resolution, and how to build your own custom component registry.',
  alternates: {
    canonical: 'https://kit.n3wth.com/blog/shadcn-registry-protocol-deep-dive',
  },
  openGraph: {
    title: 'The shadcn Registry Protocol: A Technical Deep Dive — n3wth/kit',
    description: 'How the JSON schema, dependency resolution, and install flow work under the hood.',
    url: 'https://kit.n3wth.com/blog/shadcn-registry-protocol-deep-dive',
    type: 'article',
    publishedTime: '2026-04-09T00:00:00Z',
    authors: ['Oliver Newth'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The shadcn Registry Protocol: A Technical Deep Dive — n3wth/kit',
    description: 'How the JSON schema, dependency resolution, and install flow work under the hood.',
  },
  keywords: [
    'shadcn registry protocol',
    'custom component registry',
    'shadcn registry schema',
    'AI coding tools component registry',
    'build shadcn registry',
    'registry-item.json schema',
    'component distribution protocol',
    'shadcn cli install',
  ],
}

export default function Post() {
  return (
    <PostLayout
      title="The shadcn Registry Protocol: A Technical Deep Dive"
      date="April 9, 2026"
      readingTime="12 min read"
    >
      <p>
        The shadcn registry protocol is one of those infrastructure decisions
        that looks simple from the outside and reveals surprising depth when you
        dig in. It is how shadcn/ui distributes components as source code instead
        of compiled packages. It is also the mechanism that makes component
        registries like kit possible.
      </p>

      <p>
        This post covers the protocol in technical detail: how the JSON schema
        works, how the CLI resolves dependencies, how the install process writes
        files into your project, and what you need to build your own registry.
        The target is developers who want to understand the plumbing — either to
        extend it or to build on top of it.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        Why source code distribution matters
      </h2>

      <p>
        Before getting into the mechanics, it helps to understand the design
        decision. Traditional component libraries ship as npm packages. You
        install them, import the exported types and components, and your code
        depends on the package version forever. Customizing beyond the exposed
        API means either patching the package (fragile) or forking it (expensive
        to maintain).
      </p>

      <p>
        shadcn/ui chose a different model: copy the source into your project.
        You run an install command, the component files land in your codebase,
        and from that point on you own them. There is no runtime dependency on
        the registry. No version pinning. No update pressure. Just files.
      </p>

      <p>
        The tradeoff is that you also get the maintenance burden. But that
        tradeoff is worth it for design-system-adjacent code, where you almost
        always need to diverge from the upstream defaults eventually. And for AI
        coding tools, it matters for a different reason: the model can read files
        in your project. It cannot read inside{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">node_modules</code>.
        Source-installed components are visible to the tools generating code
        against them.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        The registry schema
      </h2>

      <p>
        A registry is a collection of JSON files served over HTTP. There are two
        schema types: a registry manifest and individual registry items.
      </p>

      <p>
        The{' '}
        <span className="font-medium text-ink">registry manifest</span>{' '}
        (validated against{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
          https://ui.shadcn.com/schema/registry.json
        </code>
        ) describes the registry itself and its items:
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "n3wth",
  "homepage": "https://kit.n3wth.com",
  "items": [
    {
      "name": "button",
      "type": "registry:ui",
      "title": "Button",
      "description": "Multi-variant button with responsive sizes.",
      "registryDependencies": ["cn"],
      "files": [
        {
          "path": "registry/new-york/button/button.tsx",
          "type": "registry:ui"
        }
      ]
    }
  ]
}`}
      </pre>

      <p>
        The manifest is the source of truth during the build step. A build
        script reads it and generates the per-item JSON files that the CLI
        actually fetches. The manifest is for authoring; the individual item
        files are for distribution.
      </p>

      <p>
        A{' '}
        <span className="font-medium text-ink">registry item</span>{' '}
        (validated against{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
          https://ui.shadcn.com/schema/registry-item.json
        </code>
        ) is what the CLI fetches. The key difference from the manifest entry
        is that it includes the full file content inline:
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "button",
  "title": "Button",
  "description": "Multi-variant button with responsive sizes.",
  "type": "registry:ui",
  "registryDependencies": ["cn"],
  "files": [
    {
      "path": "registry/new-york/button/button.tsx",
      "content": "import { forwardRef } from 'react'\\n// ... full source",
      "type": "registry:ui"
    }
  ]
}`}
      </pre>

      <p>
        The file content is embedded as a string. The CLI does not need to make
        a separate request per file. One fetch per registry item is all it takes.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        Item types
      </h2>

      <p>
        The{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">type</code>{' '}
        field controls both how the CLI categorizes the item and where it writes
        the files. The defined types are:
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`registry:style      // Design system base (CSS vars, global styles)
registry:lib        // Utility functions (cn, formatters, hooks)
registry:ui         // UI components
registry:block      // Multi-file page sections or patterns
registry:component  // Single-purpose standalone components
registry:page       // Full page templates
registry:file       // Arbitrary files (config, types, etc.)`}
      </pre>

      <p>
        In practice,{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">registry:ui</code>{' '}
        and{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">registry:lib</code>{' '}
        cover the majority of use cases.{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">registry:style</code>{' '}
        is special: it installs CSS variables and global styles rather than
        component files, which is how design system tokens get distributed.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        Dependency resolution
      </h2>

      <p>
        The two dependency fields serve different purposes:
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`{
  "dependencies": ["clsx", "tailwind-merge"],
  "registryDependencies": ["cn", "button"]
}`}
      </pre>

      <p>
        <span className="font-medium text-ink">dependencies</span> are npm
        packages. The CLI checks whether they are already in{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">package.json</code>{' '}
        and installs any that are missing. This is a straightforward npm install
        step.
      </p>

      <p>
        <span className="font-medium text-ink">registryDependencies</span>{' '}
        are other registry items. When the CLI encounters these, it resolves
        them against the same registry. If you install a{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">pricing-card</code>{' '}
        that depends on{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">button</code>{' '}
        and{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">cn</code>,
        the CLI fetches and installs all three. Resolution is recursive — a
        dependency can have its own dependencies.
      </p>

      <p>
        You can also reference items from the shadcn/ui base registry by name.
        If your component depends on a shadcn primitive, the CLI knows to fetch
        it from{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">ui.shadcn.com</code>{' '}
        rather than your registry.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        The install flow in detail
      </h2>

      <p>
        Running the install command triggers a multi-step process:
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`npx shadcn add https://kit.n3wth.com/r/card.json`}
      </pre>

      <p>
        Step by step:
      </p>

      <ol className="list-inside list-decimal space-y-3 marker:text-ink-faint">
        <li>
          <span className="font-medium text-ink">Fetch the item JSON</span>{' '}
          — the CLI fetches the URL and parses the registry-item JSON. It
          validates the schema and extracts the item fields.
        </li>
        <li>
          <span className="font-medium text-ink">Resolve registryDependencies</span>{' '}
          — for each name in{' '}
          <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">registryDependencies</code>,
          the CLI constructs a URL (same base URL, item name as filename) and
          fetches that item too. This recurses until all dependencies are
          resolved.
        </li>
        <li>
          <span className="font-medium text-ink">Read components.json</span>{' '}
          — the CLI reads your project&apos;s{' '}
          <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">components.json</code>{' '}
          to determine the target directory and path aliases.
        </li>
        <li>
          <span className="font-medium text-ink">Write files</span>{' '}
          — each file in the resolved item set is written to the configured
          component directory. The{' '}
          <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">path</code>{' '}
          field in the item is used as a hint but the actual destination is
          controlled by your{' '}
          <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">components.json</code>{' '}
          config.
        </li>
        <li>
          <span className="font-medium text-ink">Install npm dependencies</span>{' '}
          — any packages in{' '}
          <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">dependencies</code>{' '}
          that are not already in{' '}
          <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">package.json</code>{' '}
          get added via your package manager.
        </li>
      </ol>

      <p>
        The entire flow is stateless from the registry&apos;s perspective. There
        is no install ledger, no user accounts, no API keys. The CLI just fetches
        JSON and writes files.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        How kit builds the registry
      </h2>

      <p>
        kit&apos;s registry lives in a Next.js project. The source components
        are in{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">registry/</code>{' '}
        and the manifest is in{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">registry.json</code>.
        A build script reads the manifest, reads each referenced source file,
        and generates the per-item JSON files in{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">public/r/</code>.
        The Next.js app serves them as static files.
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`# Source
registry/
  lib/cn/cn.ts
  new-york/
    button/button.tsx
    badge/badge.tsx
    card/card.tsx
registry.json

# Built output
public/r/
  cn.json          # { name, type, files: [{ content: "..." }] }
  button.json
  badge.json
  card.json`}
      </pre>

      <p>
        The build script inlines the file content into each item JSON. After
        that, the static files are immutable until the next build. Deployment to
        Vercel gives you a CDN-backed static registry with zero server
        infrastructure.
      </p>

      <p>
        Here is the structure of the build script pattern:
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`import { readFileSync, writeFileSync } from 'fs'
import { registry } from './registry.json'

for (const item of registry.items) {
  const files = item.files.map((file) => ({
    path: file.path,
    type: file.type,
    content: readFileSync(file.path, 'utf-8'),
  }))

  const registryItem = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: item.name,
    title: item.title,
    description: item.description,
    type: item.type,
    dependencies: item.dependencies,
    registryDependencies: item.registryDependencies,
    files,
  }

  writeFileSync(
    \`public/r/\${item.name}.json\`,
    JSON.stringify(registryItem, null, 2)
  )
}`}
      </pre>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        Building your own registry
      </h2>

      <p>
        The protocol is open and the schema is public. Building your own registry
        requires three things: component source files, a build script that
        produces item JSON, and a server to host the JSON files.
      </p>

      <p>
        The minimal viable registry is a static folder of JSON files on any
        web host. You do not need Next.js, a database, or a build pipeline.
        You can author the item JSON manually if your registry is small:
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`# Minimal registry structure
registry/
  components/
    my-button.tsx
  r/
    my-button.json   # authored by hand or generated`}
      </pre>

      <p>
        For a production registry with more than a handful of components, you
        want a build step. The key requirements are:
      </p>

      <ul className="list-inside list-disc space-y-2 marker:text-ink-faint">
        <li>
          <span className="font-medium text-ink">Single source of truth</span>{' '}
          — the manifest drives the build. Do not manually maintain per-item JSON.
        </li>
        <li>
          <span className="font-medium text-ink">Content inlining</span>{' '}
          — file content must be embedded in the item JSON, not referenced by
          path. The CLI cannot follow links back to your source tree.
        </li>
        <li>
          <span className="font-medium text-ink">Schema validation</span>{' '}
          — validate your output against the schema before deploying. A malformed
          item JSON will silently fail to install in ways that are hard to debug.
        </li>
        <li>
          <span className="font-medium text-ink">Correct CORS headers</span>{' '}
          — the CLI fetches your JSON from the user&apos;s machine, which means
          your server needs CORS configured for cross-origin requests. For static
          files on Vercel or Cloudflare, this is on by default.
        </li>
      </ul>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        The style item: distributing design tokens
      </h2>

      <p>
        The{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">registry:style</code>{' '}
        type is worth examining separately because it works differently from
        component items. Instead of writing TypeScript files, it injects CSS
        variables and configuration into your project.
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`{
  "name": "n3wth",
  "type": "registry:style",
  "description": "Flat, minimal design system tokens.",
  "cssVars": {
    "theme": {
      "font-sans": "Inter, system-ui, -apple-system, sans-serif",
      "radius": "0.625rem"
    },
    "light": {
      "background": "0 0% 100%",
      "foreground": "0 0% 3.9%",
      "primary": "0 0% 9%",
      "border": "0 0% 89.8%"
    },
    "dark": {
      "background": "0 0% 0%",
      "foreground": "0 0% 98%",
      "primary": "0 0% 98%",
      "border": "0 0% 14.9%"
    }
  },
  "files": []
}`}
      </pre>

      <p>
        When a style item is installed, the CLI writes these values into your{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">globals.css</code>{' '}
        or equivalent, following the Tailwind CSS variable convention. The
        component items in the registry then reference these variables using the
        standard{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">hsl(var(--background))</code>{' '}
        pattern.
      </p>

      <p>
        This is how a registry distributes a complete design system in one install
        command. Install the style first, then install individual components that
        reference the CSS variables the style defined. All components will pick
        up the correct tokens automatically.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        What the protocol does not handle
      </h2>

      <p>
        The registry protocol is deliberately narrow. It handles one thing:
        distributing files. It does not handle:
      </p>

      <ul className="list-inside list-disc space-y-2 marker:text-ink-faint">
        <li>
          <span className="font-medium text-ink">Versioning</span>{' '}
          — there is no version field in the schema. If you want versioning, you
          need to manage it out-of-band (different URLs, a version query param, or
          a separate registry manifest per version).
        </li>
        <li>
          <span className="font-medium text-ink">Updates</span>{' '}
          — reinstalling a component overwrites the file. There is no diff or
          merge. This is intentional: you own the source, so updates are a
          manual decision.
        </li>
        <li>
          <span className="font-medium text-ink">Authentication</span>{' '}
          — the CLI fetches public URLs. Private registries need to be handled
          at the network level (VPN, private CDN) not at the protocol level.
        </li>
        <li>
          <span className="font-medium text-ink">AI context</span>{' '}
          — the protocol distributes source code. Teaching AI tools how to use
          that source code is a separate problem.
        </li>
      </ul>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        Extending the protocol for AI tools
      </h2>

      <p>
        AI coding tools have a different requirement than the shadcn CLI: they
        need to understand how to use a component, not just install it. A
        component&apos;s source tells the model the prop interface. But it
        does not tell the model which variant to use in which context, what
        constraints the design system enforces, or which components should be
        composed with which.
      </p>

      <p>
        kit extends the registry pattern with an AI context layer. Each
        component has an associated context description that travels with the
        source. The context describes prop semantics, usage constraints, and
        composition patterns in a format optimized for language model consumption:
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`# Button component context (in .cursorrules / AGENTS.md)

## Button
Props: variant, size, isLoading, leftIcon, rightIcon, asChild, touchTarget

Variants:
- primary: main CTA only. One per view.
- secondary: supporting actions
- ghost: tertiary, navigation contexts
- glass: over image/video backgrounds only

Constraints:
- Do not add custom className for sizing — use the size prop
- Use touchTarget={true} for mobile primary actions (WCAG 2.5.5)
- Loading state: set isLoading, do not disable manually
- Never nest interactive elements inside Button`}
      </pre>

      <p>
        This context is installed alongside the component source. From that point
        on, every AI tool that reads the context file understands not just the
        component&apos;s API but how to use it correctly in your design system.
      </p>

      <p>
        The result is AI-generated code that references your actual components,
        uses the correct variants, and respects your design constraints — instead
        of reaching for shadcn defaults because that is what the training data
        contains.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        Protocol summary
      </h2>

      <p>
        The shadcn registry protocol is:
      </p>

      <ul className="list-inside list-disc space-y-2 marker:text-ink-faint">
        <li>
          A JSON schema for describing components and their dependencies
        </li>
        <li>
          A URL convention: serve item JSON at{' '}
          <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
            https://your-registry.com/r/[name].json
          </code>
        </li>
        <li>
          A CLI that fetches, resolves dependencies, and writes files into the
          project
        </li>
        <li>
          A style item type for distributing CSS variables alongside components
        </li>
      </ul>

      <p>
        The entire system is stateless, public, and requires no special
        infrastructure. You can run a registry from a static file host. The
        protocol is open: no registry approval process, no npm account required.
      </p>

      <p>
        If you are building a design system that other people (or AI tools) will
        use, this is the distribution mechanism to understand. It is what ships
        components as source code. Everything else — versioning, AI context,
        documentation — you build on top.
      </p>

      <div className="mt-12 rounded-lg border border-rail bg-bg-soft p-6">
        <p className="text-ink">
          kit uses the shadcn registry protocol to distribute components with
          context packs: source code you own, plus context that teaches your
          tools to use them correctly.
        </p>
        <a
          href="/docs/getting-started"
          className="mt-4 inline-block text-sm text-ink underline underline-offset-4"
        >
          Build with kit
        </a>
      </div>
    </PostLayout>
  )
}
