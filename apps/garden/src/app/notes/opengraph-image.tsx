import { ogCard, OG_SIZE } from '@/lib/og'
import { getPublishedNoteCount } from '@/lib/content'

export const runtime = 'nodejs'
export const alt = 'Field guide — every plant in the garden'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  const count = getPublishedNoteCount()
  return ogCard({
    title: 'Field guide',
    subtitle: `${count} notes on careers, learning, health, and building things`,
  })
}
