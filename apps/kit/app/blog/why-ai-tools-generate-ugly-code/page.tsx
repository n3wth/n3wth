import type { Metadata } from 'next'
import { PostLayout } from '../_components/post-layout'

export const metadata: Metadata = {
  title: 'Why AI Tools Generate Ugly Code',
  description: 'AI coding tools produce functional but generic code because they lack context about your design system. Here\'s how AI context packs fix that.',
  alternates: {
    canonical: 'https://kit.n3wth.com/blog/why-ai-tools-generate-ugly-code',
  },
  openGraph: {
    title: 'Why AI Tools Generate Ugly Code — n3wth/kit',
    description: 'AI coding tools produce generic code because they lack design system context.',
    url: 'https://kit.n3wth.com/blog/why-ai-tools-generate-ugly-code',
    type: 'article',
    publishedTime: '2026-02-15T00:00:00Z',
    authors: ['Oliver Newth'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Why AI Tools Generate Ugly Code — n3wth/kit',
    description: 'AI coding tools produce generic code because they lack design system context.',
  },
}

export default function Post() {
  return (
    <PostLayout
      title="Why AI Tools Generate Ugly Code"
      date="February 15, 2026"
      readingTime="5 min read"
    >
      <p>
        You open v0, describe a pricing page, and get back something that works.
        The layout is reasonable. The code compiles. But it looks like every
        other AI-generated page on the internet: safe gradients, generic
        shadows, rounded-2xl cards with too much padding.
      </p>

      <p>
        This is not a model quality problem. GPT-4, Claude, Gemini &mdash; they can
        all write excellent code. The problem is context. Or rather, the absence
        of it.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        The context gap
      </h2>

      <p>
        When you ask an AI tool to build a component, it reaches for the
        broadest possible defaults. It has no idea that your design system uses
        4px border radius instead of 16px. It does not know your brand avoids
        gradients. It cannot reference your custom Button variant API because it
        has never seen your component library.
      </p>

      <p>
        The result is code that is structurally correct but aesthetically
        generic. Every project gets the same Tailwind soup:
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`// What AI generates without context
<div className="rounded-2xl bg-gradient-to-br
  from-purple-500 to-pink-500 p-8 shadow-2xl">
  <h2 className="text-3xl font-bold text-ink">
    Pricing
  </h2>
</div>`}
      </pre>

      <p>
        Compare that to what you actually want &mdash; something that respects your
        design tokens, uses your component primitives, and follows your
        conventions:
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`// What AI generates WITH your design context
<Section>
  <Heading level={2}>Pricing</Heading>
  <div className="mt-8 grid grid-cols-3 gap-4">
    <PricingCard tier="starter" />
    <PricingCard tier="pro" featured />
    <PricingCard tier="enterprise" />
  </div>
</Section>`}
      </pre>

      <p>
        The second version is shorter, more maintainable, and actually looks
        like your product. The difference is not smarter prompting. It is
        structured context.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        Why prompting alone does not work
      </h2>

      <p>
        The obvious workaround is to include instructions in your prompt:
        &ldquo;use my Button component, keep borders at 1px, no gradients.&rdquo;
        This works for a single generation. It falls apart at scale.
      </p>

      <p>
        A real design system has hundreds of decisions baked into it. Spacing
        scales, color semantics, component APIs, composition patterns, animation
        preferences, accessibility standards. No one is going to paste all of
        that into a chat prompt every time they need a component.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        AI context packs
      </h2>

      <p>
        This is the idea behind AI context packs. Instead of repeating yourself
        in every prompt, you define your design system context once in a format
        that AI tools can consume. A context pack includes:
      </p>

      <ul className="list-inside list-disc space-y-2">
        <li>
          <span className="text-ink">Component API reference</span> &mdash; what
          components exist, their props, valid combinations
        </li>
        <li>
          <span className="text-ink">Design tokens</span> &mdash; colors, spacing,
          typography, radii, all as CSS variables
        </li>
        <li>
          <span className="text-ink">Composition patterns</span> &mdash; how
          components are meant to be combined
        </li>
        <li>
          <span className="text-ink">Constraints</span> &mdash; what to avoid,
          anti-patterns, brand rules
        </li>
      </ul>

      <p>
        Drop a{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">
          .cursorrules
        </code>{' '}
        file in your project root, configure your MCP server, and suddenly every
        AI generation is contextually aware of your design system.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        How kit approaches this
      </h2>

      <p>
        kit is built on two primitives: the shadcn registry protocol
        for distributing components, and AI context packs for teaching tools how
        to use them.
      </p>

      <p>
        When you install a component from kit, you get the source code in your
        project &mdash; not a node_modules dependency. When your AI tool has the
        context pack loaded, it knows exactly how to use that component: the
        correct props, the right composition patterns, the design constraints.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        The end of generic
      </h2>

      <p>
        AI-generated code does not have to look like AI-generated code. The
        models are capable of producing excellent, idiomatic, brand-consistent
        output. They just need the right context to do it.
      </p>

      <p>
        The gap between &ldquo;works&rdquo; and &ldquo;feels like ours&rdquo; is
        not a model problem. It is an infrastructure problem. Context packs are
        the infrastructure.
      </p>

      <div className="mt-12 rounded-lg border border-rail bg-bg-soft p-6">
        <p className="text-ink">
          kit is a component registry with built-in context packs.
          Install components with a single command, then generate code that
          actually matches your design system.
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
