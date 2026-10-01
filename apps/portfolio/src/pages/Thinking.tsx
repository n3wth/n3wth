import { SectionHeader } from '../components/Frame'
import { usePageMeta, buildWebPageSchema } from '../hooks/usePageMeta'
import { NotesIndex } from '../components/thinking/NotesIndex'
import { StoryScene } from '../components/StoryScene'

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
      <SectionHeader as="h1" story="thinking" title="Thinking" lede="AI, design, and everyday life." />
      <div className="thinking-page story-layout">
        <StoryScene kind="thinking" />
        <div className="story-layout-content"><NotesIndex /></div>
      </div>
    </>
  )
}
