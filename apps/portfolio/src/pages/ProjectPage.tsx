import { Link, useParams } from 'react-router-dom'
import { CodeBlock } from '@n3wth/ui'
import { SiteSection, SiteHeading } from '@n3wth/ui/site'
import { projects } from '../data/content'
import { usePageMeta, buildWebPageSchema } from '../hooks/usePageMeta'

const details = {
  r3: {
    title: 'r3',
    eyebrow: 'Personal agents',
    question: 'Useful context beyond a single conversation',
    description: 'A local memory service for AI assistants. r3 combines semantic search, vector embeddings, and a knowledge graph behind an MCP interface so context can survive between sessions and tools.',
    install: 'npx @n3wth/r3',
    sections: [
      ['Memory that stays available', 'r3 stores memories locally and retrieves them by meaning. The same context can be used from desktop clients, command line tools, and custom MCP integrations.'],
      ['A graph underneath', 'Entities and relationships are extracted as memories are written, giving an assistant more than a flat list of matching text.'],
      ['Source and package', 'The website moved here; the open-source server and npm package remain in the r3 repository.'],
    ],
    source: 'https://github.com/n3wth/r3',
  },
  ui: {
    title: '@n3wth/ui',
    eyebrow: 'Shared foundation',
    question: 'A common visual system for individual sites',
    description: 'A React component library with theme tokens, typography, native controls, and page compositions shared across the n3wth sites. The package keeps the visual foundation in one place while each app owns its content and routes.',
    install: 'npm install @n3wth/ui',
    sections: [
      ['Primitives and compositions', 'Use native controls through the primitives entry point, then compose them with the shared site layout, typography, and footer pieces.'],
      ['Tokens and themes', 'The package owns the color, type, spacing, and light and dark theme foundations used by the portfolio and its related projects.'],
      ['Documentation', 'The design-system reference now lives beside the project here, with the source and published package remaining available for installation.'],
    ],
    source: 'https://github.com/n3wth/ui',
  },
} as const

type ProjectSlug = keyof typeof details

export default function ProjectPage() {
  const { slug } = useParams()
  const detail = slug && slug in details ? details[slug as ProjectSlug] : undefined
  const project = projects.find(item => item.id === slug)

  usePageMeta(
    detail ? `${detail.title} — Oliver Newth` : 'Project not found — Oliver Newth',
    detail?.description ?? 'The requested project could not be found.',
    detail ? {
      jsonLd: buildWebPageSchema({
        url: `https://n3wth.com/projects/${slug}`,
        title: `${detail.title} — Oliver Newth`,
        description: detail.description,
        breadcrumbs: [
          { name: 'Home', url: 'https://n3wth.com/' },
          { name: 'Work', url: 'https://n3wth.com/work' },
          { name: detail.title, url: `https://n3wth.com/projects/${slug}` },
        ],
      }),
    } : undefined,
  )

  if (!detail || !project) {
    return <div className="site-content-gutter py-24"><SiteHeading level={1}>Project not found</SiteHeading><Link className="mt-6 inline-block underline" to="/work">Back to work</Link></div>
  }

  return <>
    <header className="site-content-gutter pt-16 md:pt-24">
      <p className="meta">{detail.eyebrow}</p>
      <SiteHeading level={1} className="mt-4 max-w-3xl">{detail.title}</SiteHeading>
      <p className="mt-5 max-w-2xl text-xl leading-relaxed">{detail.question}</p>
      <p className="mt-6 max-w-2xl text-base leading-relaxed" style={{ color: 'var(--ink-dim)' }}>{detail.description}</p>
      <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
        <a className="inline-flex min-h-11 items-center underline underline-offset-4" href={detail.source} target="_blank" rel="noopener noreferrer">Source</a>
        <Link className="inline-flex min-h-11 items-center underline underline-offset-4" to="/work">All work</Link>
      </div>
    </header>
    <SiteSection className="site-content-gutter">
      <CodeBlock code={detail.install} size="sm" className="max-w-2xl" />
      <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
        {detail.sections.map(([heading, body]) => <article key={heading} className="border-t border-[var(--rail-strong)] pt-5"><SiteHeading variant="item" level={2}>{heading}</SiteHeading><p className="mt-3 leading-relaxed" style={{ color: 'var(--ink-dim)' }}>{body}</p></article>)}
      </div>
    </SiteSection>
  </>
}
