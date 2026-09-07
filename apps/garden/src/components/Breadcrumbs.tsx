import { Breadcrumbs as AstryxBreadcrumbs, BreadcrumbItem } from '@astryxdesign/core/Breadcrumbs'
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
    const label = note ? note.title : dehyphenated.charAt(0).toUpperCase() + dehyphenated.slice(1)
    // Only link segments that exist as notes
    const href = note ? `/${crumbSlug}` : undefined
    return { key: crumbSlug, href, label }
  })

  return (
    <div className="mb-4">
      <AstryxBreadcrumbs variant="supporting">
        <BreadcrumbItem href="/">Garden</BreadcrumbItem>
        {crumbs.map((crumb) => (
          <BreadcrumbItem key={crumb.key} href={crumb.href}>
            {crumb.label}
          </BreadcrumbItem>
        ))}
      </AstryxBreadcrumbs>
    </div>
  )
}
