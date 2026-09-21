import { Thinking as Positions } from '../components/sections/Thinking'
import { ForkLight, VisualBand } from '@n3wth/ui/visuals'
import { usePageMeta, buildWebPageSchema } from '../hooks/usePageMeta'
import { NotesIndex } from '../components/thinking/NotesIndex'

const TITLE = 'Thinking — Oliver Newth'
const DESCRIPTION = 'Positions on production AI and agents as an org design problem, plus interactive walk-throughs of real AI safety trade-offs.'

export default function ThinkingPage() {
  usePageMeta(TITLE, DESCRIPTION, {
    ogImage: '/og/thinking.png',
    jsonLd: buildWebPageSchema({
      url: 'https://n3wth.com/thinking',
      title: TITLE,
      description: DESCRIPTION,
      breadcrumbs: [
        { name: 'Home', url: 'https://n3wth.com/' },
        { name: 'Thinking', url: 'https://n3wth.com/thinking' },
      ],
    }),
  })

  return (
    <>
      <Positions />
      <VisualBand height="clamp(220px, 42svh, 420px)">
        <ForkLight />
      </VisualBand>
      <NotesIndex />
    </>
  )
}
