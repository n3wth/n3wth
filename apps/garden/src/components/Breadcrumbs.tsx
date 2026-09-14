import { Breadcrumbs as AstryxBreadcrumbs, BreadcrumbItem } from '@n3wth/ui/primitives'
import { getNoteBySlug } from '@/lib/content'

interface BreadcrumbsProps {
  slug: string
}

export function Breadcrumbs({ slug }: BreadcrumbsProps) {
  const parts = slug.split('/')
  if (parts.length <= 1) return null

  const crumbs = parts.slice(0, -1).map((part, i) => {
    const crumbSlug = parts.slice(0, i + 1).join('/')
    const note = getNoteBySlug(crumbSlug)
    // Prefer the note's real title (sentence case, as written); fall back
    // to a de-hyphenated segment with only its first letter capitalized.
    const dehyphenated = part.replace(/-/g, ' ')
    const label = part.toLowerCase() === 'mocs'
      ? 'Maps of Content'
      : note
        ? note.title
        : dehyphenated.charAt(0).toUpperCase() + dehyphenated.slice(1)
    // Only link segments that exist as notes
    const href = note ? `/${crumbSlug}` : undefined
    return { key: crumbSlug, href, label }
  })

  return (
    <div className="note-breadcrumbs">
      <AstryxBreadcrumbs variant="supporting">
        {crumbs.map((crumb) => (
          <BreadcrumbItem key={crumb.key} href={crumb.href}>
            <span className="note-breadcrumb-label">{crumb.label}</span>
          </BreadcrumbItem>
        ))}
      </AstryxBreadcrumbs>
    </div>
  )
}
