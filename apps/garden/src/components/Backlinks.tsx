import { Link } from 'next-view-transitions'
import { Divider } from '@astryxdesign/core/Divider'
import type { Backlink } from '@/lib/backlinks'

interface BacklinkProps {
  backlinks: Backlink[]
}

const MAX_VISIBLE = 6

export function Backlinks({ backlinks }: BacklinkProps) {
  if (backlinks.length === 0) return null

  /* Mentions that carry a sentence say more than bare links — show them
     first, then the link-list mentions fill the remaining slots. */
  const ordered = [...backlinks].sort((a, b) => Number(!!b.context) - Number(!!a.context))
  const visible = ordered.slice(0, MAX_VISIBLE)
  const rest = ordered.slice(MAX_VISIBLE)

  return (
    <section className="mt-16">
      <Divider variant="subtle" />
      <h2 className="label mt-8 mb-4">
        Mentioned in
        <span className="ml-2 text-[var(--color-text-disabled)]">{backlinks.length}</span>
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visible.map((link) => (
          <li key={link.slug} className="min-w-0">
            <Link
              href={`/${link.slug}`}
              className="press group flex h-full flex-col gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-surface)] p-4 transition-colors hover:border-[var(--color-border-emphasized)] hover:bg-[var(--color-overlay-hover)]"
            >
              <span className="text-sm font-medium text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-text-accent)]">
                {link.title}
              </span>
              {link.context && (
                <span className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  {link.context.before}
                  <span className="text-[var(--color-text-primary)]">{link.context.mention}</span>
                  {link.context.after}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      {/* The tail used to be a sentence counting links it would not hand
          over. On a garden the whole point is the next hop, so the rest
          ship as links — quieter than the cards, still one click away. */}
      {rest.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {rest.map((link) => (
            <li key={link.slug}>
              <Link
                href={`/${link.slug}`}
                className="text-xs text-[var(--color-text-secondary)] underline underline-offset-4 decoration-transparent transition-colors hover:text-[var(--color-text-primary)] hover:decoration-[var(--color-border-emphasized)]"
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
