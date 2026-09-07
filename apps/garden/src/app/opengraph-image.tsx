import { ogCard, OG_SIZE } from '@/lib/og'

export const runtime = 'nodejs'
export const alt = 'n3wth/garden — A digital garden of interconnected ideas'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return ogCard({
    title: 'n3wth/garden',
    subtitle: 'A digital garden of interconnected ideas',
  })
}
