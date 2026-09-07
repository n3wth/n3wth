import type { Metadata } from 'next'
import { PostLayout } from '../_components/post-layout'

export const metadata: Metadata = {
  title: 'Why Every AI Tool Generates the Same Looking UI',
  description: 'AI coding tools default to shadcn\'s visual style because of training data bias. Design system packaging solves this — here\'s how.',
  alternates: {
    canonical: 'https://kit.n3wth.com/blog/why-every-ai-tool-generates-same-ui',
  },
  keywords: [
    'vibe coding design system',
    'AI generated UI looks same',
    'shadcn alternatives',
    'AI coding tools design',
    'design system AI context',
    'shadcn ui alternatives',
  ],
  openGraph: {
    title: 'Why Every AI Tool Generates the Same Looking UI — n3wth/kit',
    description: 'AI coding tools default to shadcn\'s visual style because of training data bias.',
    url: 'https://kit.n3wth.com/blog/why-every-ai-tool-generates-same-ui',
    type: 'article',
    publishedTime: '2026-04-06T00:00:00Z',
    authors: ['Oliver Newth'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Why Every AI Tool Generates the Same Looking UI — n3wth/kit',
    description: 'AI coding tools default to shadcn\'s visual style because of training data bias.',
  },
}

export default function Post() {
  return (
    <PostLayout
      title="Why Every AI Tool Generates the Same Looking UI"
      date="April 6, 2026"
      readingTime="8 min read"
    >
      <p>
        Ask any AI coding tool to build you a dashboard. Cursor, v0, Lovable,
        Bolt &mdash; it does not matter which one. You will get white cards with
        subtle borders, a sidebar with icons and text, a top bar with a search
        input, and everything laid out in a grid. The buttons will be slightly
        rounded. The typography will be Inter or something close to it.
      </p>

      <p>
        You have seen this UI before. You will see it again. Every vibe coding
        session produces a variant of the same design. The specific app changes.
        The aesthetic does not.
      </p>

      <p>
        This is not a coincidence, and it is not a hallucination. It is the
        predictable output of systems trained on a specific corpus of code that
        looks a specific way.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        The shadcn monoculture
      </h2>

      <p>
        shadcn/ui launched in early 2023 and spread faster than almost any
        component library in recent memory. Within months, it had become the
        default answer to &ldquo;what should I use for components in my Next.js
        project.&rdquo; By the time the major AI coding tools were being trained
        on GitHub data, shadcn components were everywhere.
      </p>

      <p>
        The training data for these models is heavily weighted toward whatever
        is popular on GitHub. shadcn was popular. Its visual patterns &mdash; the
        class names, the composition style, the Radix primitives underneath
        &mdash; became deeply embedded in the model weights. When you ask for a
        modal component, the model has seen ten thousand shadcn Dialog
        implementations. It reaches for that pattern automatically.
      </p>

      <p>
        This is not a flaw in shadcn. shadcn is well-designed. The problem is
        what happens when every AI tool defaults to the same well-designed
        starting point for every project, regardless of whether that starting
        point fits.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        What vibe coding actually produces
      </h2>

      <p>
        The term &ldquo;vibe coding&rdquo; has entered the vocabulary to describe
        a workflow: describe what you want, accept what the AI produces, iterate
        loosely. The output is functional software built fast. But there is a
        structural problem embedded in the workflow.
      </p>

      <p>
        When you vibe code, you are implicitly accepting the model&apos;s default
        aesthetic. You are not designing a UI. You are inheriting one. And the
        one you are inheriting is a statistical average of what appeared on
        GitHub between 2022 and 2024, heavily weighted toward shadcn/ui on top
        of Tailwind.
      </p>

      <p>
        Here is what that looks like in code:
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`// What you get when you ask an AI to build a card component
<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold text-gray-900">
      {title}
    </h3>
    <Badge variant="secondary">{status}</Badge>
  </div>
  <p className="mt-2 text-sm text-gray-500">{description}</p>
  <div className="mt-4 flex gap-2">
    <Button size="sm">View details</Button>
    <Button size="sm" variant="outline">Edit</Button>
  </div>
</div>`}
      </pre>

      <p>
        This is fine code. It is readable, it works, it follows conventions.
        But it is also generic. The{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">shadow-sm</code>,
        the{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">rounded-lg</code>,
        the neutral gray palette &mdash; these are not design decisions. They are
        defaults. They are what you get when there is no design system to
        reach for instead.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        Why prompting does not solve it
      </h2>

      <p>
        The first instinct is to fight the defaults with prompting. &ldquo;Use a
        flat design, no shadows, stone color palette.&rdquo; This works once. It
        breaks down across a session, across a project, across a team.
      </p>

      <p>
        A design system is not a list of rules. It is a collection of decisions
        that compound. Your border radius is 4px, not 8px. Your gray is
        stone-600, not gray-500. Your buttons do not have visible focus rings
        except on keyboard navigation. Your spacing scale goes 4, 8, 12, 16,
        24, 32 &mdash; not the Tailwind defaults. Your heading font is different
        from your body font. Your disabled states use opacity-40, not
        opacity-50.
      </p>

      <p>
        You cannot stuff all of that into a prompt. And even if you could, the
        model has to interpret it correctly every time. One misread and you get
        a component that is 80% right but subtly wrong &mdash; which is somehow
        worse than being obviously wrong, because it takes longer to notice.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        The model is not the problem
      </h2>

      <p>
        It is worth being precise here: the model itself is not what generates
        generic UI. The model is capable of generating code that fits your exact
        design system, uses your specific component APIs, and respects your
        constraints perfectly.
      </p>

      <p>
        What limits it is information. The model does not know about your design
        system. It has never seen your codebase. It cannot reference your
        component library. So it reaches for what it does know: the statistical
        center of its training data, which looks like shadcn.
      </p>

      <p>
        Give the model the right information and it will produce the right
        output. The problem is the mechanism for giving it that information at
        scale.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        Design system packaging as the solution
      </h2>

      <p>
        The answer is not better prompting. It is better packaging. Specifically,
        it is packaging your design system in a format that AI tools can consume
        automatically, without requiring you to re-explain it every session.
      </p>

      <p>
        This is what design system packaging means: taking the decisions baked
        into your design system and making them available to AI tools as
        structured context. There are three layers to this.
      </p>

      <p>
        <span className="font-medium text-ink">Component source.</span>{' '}
        The model needs to see the actual component implementations. Not the
        npm package internals &mdash; the source files in your project. When your
        Button component lives in{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">components/button.tsx</code>,
        the model can read it, understand the prop API, see the variant
        definitions, and generate code that uses it correctly.
      </p>

      <p>
        <span className="font-medium text-ink">Design token definitions.</span>{' '}
        Your CSS variables, your Tailwind config, your spacing scale. When the
        model has access to this, it stops guessing at colors and starts using
        the actual values from your system.
      </p>

      <p>
        <span className="font-medium text-ink">Behavioral constraints.</span>{' '}
        The decisions that are hardest to infer from code: no gradients, no
        outer shadows, accessibility requirements, composition patterns, things
        to avoid. These belong in a context file that travels with the codebase.
      </p>

      <p>
        Together, these three layers replace the shadcn defaults with your
        defaults. The model still generates code quickly. But the code it
        generates looks like your product, not like every other vibe-coded app
        on the internet.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        What this looks like in practice
      </h2>

      <p>
        Without design system context, you get a component that uses shadcn
        patterns regardless of what you actually want:
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`// Without context: AI defaults to shadcn patterns
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function MetricCard({ title, value, trend }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <Badge variant={trend > 0 ? "default" : "destructive"}>
            {trend > 0 ? "+" : ""}{trend}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}`}
      </pre>

      <p>
        With design system context installed via kit, the same prompt produces
        output that uses your actual components and your actual constraints:
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`// With kit context pack: AI uses your design system
import { StatCard } from "@/components/stat-card"

export function MetricCard({ title, value, trend }) {
  return (
    <StatCard
      label={title}
      value={value}
      delta={trend}
      deltaFormat="percent"
    />
  )
}`}
      </pre>

      <p>
        The second version is shorter because the model knows your{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">StatCard</code>{' '}
        component exists and what it accepts. It does not need to reconstruct
        that logic from primitives. It also does not add a shadow, because the
        context pack specifies no outer shadows.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        The registry approach
      </h2>

      <p>
        The shadcn registry protocol gives us a standard way to distribute
        component source. Instead of installing a package and getting compiled
        output, you install the source directly into your project:
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`npx shadcn add https://kit.n3wth.com/r/card.json`}
      </pre>

      <p>
        The component lands in your codebase as a file you own. You can modify
        it. Your AI tools can read it. This is the first step: get the
        components into the project in source form so the model has something
        to reference.
      </p>

      <p>
        The second step is the context pack: a structured file that describes
        your design system to AI tools. For Cursor, this is a{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">.cursorrules</code>{' '}
        file. For other AI tools, it is an{' '}
        <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">AGENTS.md</code>.
        For MCP-compatible tools, it is a server that exposes component metadata
        on demand.
      </p>

      <pre className="rounded-lg border border-rail bg-bg-soft p-4 font-mono text-sm text-ink-dim overflow-x-auto">
{`# Design system constraints (in .cursorrules or AGENTS.md)

## Components
- Use components from @/components — never install shadcn/ui directly
- StatCard for metrics, not manual card + badge composition
- DataTable for tabular data with sorting and pagination

## Visual rules
- No shadows (shadow-*, drop-shadow-*)
- No gradients (bg-gradient-*, from-*, to-*)
- Border radius: rounded (4px) or rounded-lg (8px) only
- Color palette: stone-* for neutral, not gray-* or zinc-*

## Spacing
- Section gaps: gap-6 or gap-8
- Card padding: p-4 or p-6
- Do not use p-8 or larger inside cards`}
      </pre>

      <p>
        With both pieces in place &mdash; components as source, constraints as
        context &mdash; the model generates code that fits your system instead of
        reaching for shadcn defaults.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        Why this matters more as AI tools improve
      </h2>

      <p>
        The irony is that better models make this problem more important, not
        less. A weaker model produces output that is obviously AI-generated and
        obviously wrong. You throw it away and start over. A stronger model
        produces output that is subtly wrong: it mostly fits your design system
        but uses the wrong token here, the wrong component variant there.
      </p>

      <p>
        That subtle wrongness compounds. Each component the model generates
        without proper context drifts slightly from the system. After a few
        sessions you have a codebase where half the components follow your
        design system and half follow the model&apos;s training data defaults.
        That inconsistency is expensive to fix and expensive to maintain.
      </p>

      <p>
        Design system packaging solves this before it happens. When the context
        is always present, the drift does not accumulate. Every generation pulls
        toward your system, not toward the statistical average of GitHub.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-ink">
        What to do today
      </h2>

      <p>
        If you are already using vibe coding in your workflow, the migration
        path is straightforward:
      </p>

      <ul className="list-inside list-disc space-y-2">
        <li>
          <span className="text-ink">Audit your components.</span>{' '}
          Which ones exist in your project? Write down their names and prop APIs.
        </li>
        <li>
          <span className="text-ink">Document your constraints.</span>{' '}
          Border radius decisions, color palette choices, shadow rules,
          spacing conventions. The shorter the list, the more likely the model
          follows it consistently.
        </li>
        <li>
          <span className="text-ink">Add a context file.</span>{' '}
          Put it in{' '}
          <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">.cursorrules</code>{' '}
          or{' '}
          <code className="rounded bg-bg-raise px-1.5 py-0.5 text-sm text-ink-dim">AGENTS.md</code>.
          Commit it. It should travel with the codebase.
        </li>
        <li>
          <span className="text-ink">Prefer source-installed components.</span>{' '}
          The model can read files in your project. It cannot read inside
          node_modules. Components installed via the shadcn registry format
          are readable.
        </li>
      </ul>

      <p>
        You do not need to overhaul your workflow. You need to add the layer
        that was missing: structured context that travels with the project.
      </p>

      <p>
        The AI tools will continue to improve. The output will get better and
        faster. But without design system context, better and faster still means
        more of the same. The shadcn aesthetic will keep showing up, slightly
        different each time, in every project.
      </p>

      <p>
        The fix is not more prompting. It is better packaging.
      </p>

      <div className="mt-12 rounded-lg border border-rail bg-bg-soft p-6">
        <p className="text-ink">
          kit is a component registry with context packs. Install components as
          source, get context that teaches your tools to use them correctly.
          The shadcn registry protocol, with the context layer on top.
        </p>
        <a
          href="/docs/getting-started"
          className="mt-4 inline-block text-sm text-ink underline underline-offset-4"
        >
          Get started with kit
        </a>
      </div>
    </PostLayout>
  )
}
