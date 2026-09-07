import { getAllNotes } from '@/lib/content'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function GET() {
  const notes = getAllNotes().filter((n) => n.slug !== '')
  const random = notes[Math.floor(Math.random() * notes.length)]
  redirect('/' + random.slug)
}
