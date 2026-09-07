import { getAllNotes, getNoteBySlug } from '@/lib/content'
import { ogCard } from '@/lib/og'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return getAllNotes()
    .filter((note) => note.slug !== '')
    .map((note) => ({ slug: note.slug.split('/') }))
}

interface RouteParams {
  params: Promise<{ slug: string[] }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params
  const slugStr = slug.join('/')
  const note = getNoteBySlug(slugStr)
  
  return ogCard({
    title: note?.title ?? slugStr,
    subtitle: note?.description ?? undefined,
  })
}
