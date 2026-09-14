import Link from 'next/link'
import type { Backlink } from '@/lib/backlinks'

interface BacklinkProps {
  backlinks: Backlink[]
}

export function Backlinks({ backlinks }: BacklinkProps) {
  if (backlinks.length === 0) return null

  /* Mentions that carry a sentence say more than bare links — show them
     first, then the link-list mentions fill the remaining slots. */
  const ordered = [...backlinks].sort((a, b) => Number(!!b.context) - Number(!!a.context))
  return (
    <div className="connected-mentions">
      <ul aria-label="Notes mentioning this note">
        {ordered.map((link) => (
          <li key={link.slug} className="min-w-0">
            <Link
              href={`/${link.slug}`}
              className="press group"
            >
              <span className="connected-mention-title">
                {link.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
