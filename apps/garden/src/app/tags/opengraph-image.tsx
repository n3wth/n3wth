import { ogCard, OG_SIZE } from '@/lib/og'
import { getAllTags } from '@/lib/content'

export const runtime = 'nodejs'
export const alt = 'Groves — the garden by topic'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  const tags = getAllTags()
  const groveCount = [...tags.entries()].filter(([, notes]) => notes.length > 1).length
  return ogCard({
    title: 'Groves',
    subtitle: `${groveCount} topic clusters where notes gather`,
  })
}
