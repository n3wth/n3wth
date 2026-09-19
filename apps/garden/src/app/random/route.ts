import { getPublishedNotes } from '@/lib/content'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function GET() {
  const notes = getPublishedNotes()
  const random = notes[Math.floor(Math.random() * notes.length)]
  redirect('/' + random.slug)
}
