import Link from 'next/link'

interface TagListProps {
  tags: string[]
}

// Tags share one quiet monochrome voice — the garden's ink ramp carries
// meaning (stage, size), so pills stay neutral.
export function TagList({ tags }: TagListProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="tag-pill">
          {tag}
        </Link>
      ))}
    </div>
  )
}
