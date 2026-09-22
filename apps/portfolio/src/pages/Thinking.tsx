import { ForkLight } from '@n3wth/ui/visuals'
import { SectionHeader } from '../components/Frame'
import { usePageMeta, buildWebPageSchema } from '../hooks/usePageMeta'
import { NotesIndex } from '../components/thinking/NotesIndex'

const TITLE = 'Thinking — Oliver Newth'
const DESCRIPTION = 'Essays and notes on AI, design, and everyday life.'

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
      <SectionHeader as="h1" title="Thinking" lede={DESCRIPTION} visual={<ForkLight />} />
      <div className="thinking-page"><NotesIndex /></div>
    </>
  )
}
