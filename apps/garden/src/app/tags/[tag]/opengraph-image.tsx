import { getAllTags } from '@/lib/content'
import { ogCard, OG_SIZE } from '@/lib/og'

export const runtime = 'nodejs'
export const alt = 'n3wth/garden grove'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  const tags = getAllTags()
  return [...tags.keys()].map((tag) => ({
    tag: encodeURIComponent(tag),
  }))
}

interface ImageProps {
  params: Promise<{ tag: string }>
}

export default async function Image({ params }: ImageProps) {
  const { tag } = await params
  const decoded = decodeURIComponent(tag)
  const tags = getAllTags()
  const notes = tags.get(decoded)
  const count = notes?.length ?? 0
  
  return ogCard({
    title: decoded,
    subtitle: `${count} ${count === 1 ? 'note' : 'notes'} in this grove`,
  })
}
