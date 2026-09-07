import { Link } from 'next-view-transitions'
import { Button } from '@astryxdesign/core/Button'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { getGraphData } from '@/lib/graph'

export default function NotFound() {
  // Well-trodden paths: the most-linked evergreen notes, so a dead link
  // still lands a lost reader somewhere worth being.
  const paths = getGraphData()
    .nodes.filter((n) => n.stage === 'evergreen')
    .sort((a, b) => b.linkCount - a.linkCount)
    .slice(0, 3)

  return (
    <div className="mx-auto max-w-2xl px-6 py-32">
      {/* EmptyState's title renders as an h3; assistive tech still needs a
          top-level heading for the page. */}
      <h1 className="sr-only">Page not found</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/seedling.webp"
        alt=""
        aria-hidden
        width={140}
        height={140}
        className="mx-auto mb-2 opacity-80"
        style={{ mixBlendMode: 'screen' }}
      />
      <EmptyState
        title="This note doesn't exist yet"
        description="Maybe it's still a seed. Try browsing the garden instead."
        actions={
          <div className="flex flex-wrap justify-center gap-2">
            <Button label="Back to garden" variant="primary" href="/" />
            <Button label="Browse all notes" variant="secondary" href="/notes" />
            <Button label="Random note" variant="secondary" href="/random" />
          </div>
        }
      />
      {paths.length === 3 && (
        <div className="mt-10 text-center">
          <h2 className="label mb-3">Well-trodden paths</h2>
          <ul className="flex flex-wrap justify-center gap-2">
            {paths.map((n) => (
              <li key={n.id}>
                <Link href={`/${n.id}`} className="glass-pill press inline-flex items-center py-1.5 px-3.5 text-xs">
                  {n.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
