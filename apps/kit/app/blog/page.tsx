import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Notes on registries, context packs, and generated UI.',
  alternates: {
    canonical: 'https://kit.n3wth.com/blog',
  },
  openGraph: {
    title: 'Blog — n3wth/kit',
    description: 'Notes on registries, context packs, and generated UI.',
    url: 'https://kit.n3wth.com/blog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — n3wth/kit',
    description: 'Notes on registries, context packs, and generated UI.',
  },
}

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': 'https://kit.n3wth.com/blog#webpage',
  url: 'https://kit.n3wth.com/blog',
  name: 'Blog — n3wth/kit',
  description: 'Notes on registries, context packs, and generated UI.',
  isPartOf: { '@id': 'https://kit.n3wth.com/#website' },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: 'https://kit.n3wth.com/blog/opengraph-image',
  },
}

const posts = [
  {
    slug: 'shadcn-registry-protocol-deep-dive',
    title: 'The shadcn Registry Protocol: A Technical Deep Dive',
    date: 'April 9, 2026',
    excerpt: 'How the JSON schema, dependency resolution, and install flow work under the hood — and how to build your own custom component registry.',
  },
  {
    slug: 'why-every-ai-tool-generates-same-ui',
    title: 'Why Every AI Tool Generates the Same Looking UI',
    date: 'April 6, 2026',
    excerpt: 'AI coding tools default to shadcn\'s visual style because of training data bias. Design system packaging is the fix — not better prompting.',
  },
  {
    slug: 'why-ai-tools-generate-ugly-code',
    title: 'Why AI Tools Generate Ugly Code',
    date: 'February 15, 2026',
    excerpt: 'AI coding tools produce functional but generic code because they lack context about your design system. Here\'s how AI context packs fix that.',
  },
  {
    slug: 'shadcn-registry-protocol',
    title: 'The shadcn Registry Protocol',
    date: 'February 12, 2026',
    excerpt: 'How the shadcn registry protocol works.',
  },
  {
    slug: 'ai-context-packs-explained',
    title: 'AI Context Packs Explained',
    date: 'February 10, 2026',
    excerpt: 'What are AI context packs? How .cursorrules, AGENTS.md, and MCP configs teach AI coding tools to use your design system.',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <main className="mx-auto max-w-2xl px-6 pt-32 pb-24">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Blog
        </h1>
        <p className="mt-3 text-ink-dim">
          Notes on registries, context packs, and generated UI.
        </p>

        <div className="mt-16 space-y-12">
          {posts.map((post) => (
            <article key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <h2 className="text-xl font-semibold text-ink transition-colors group-hover:text-ink-dim">
                  {post.title}
                </h2>
                <time className="mt-2 block text-sm text-ink-faint">
                  {post.date}
                </time>
                <p className="mt-3 text-ink-dim">{post.excerpt}</p>
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
