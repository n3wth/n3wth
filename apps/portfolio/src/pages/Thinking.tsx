import { PageHeader } from '@n3wth/ui/site'
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
    <div className="thinking-page">
      <PageHeader className="site-content-gutter" title="Thinking" description={DESCRIPTION} spacing="compact" />
      <NotesIndex />
    </div>
  )
}
