import { Button } from '@n3wth/ui/primitives'
import { SectionHeader } from '../components/Frame'
import { Experience } from '../components/sections/Experience'
import './work.css'
import { usePageMeta, buildWebPageSchema } from '../hooks/usePageMeta'

const TITLE = 'Work — Oliver Newth'
const DESCRIPTION = 'Oliver Newth’s product experience at Google, Covariant, Meta, and Microsoft.'

export default function Work() {
  usePageMeta(TITLE, DESCRIPTION, {
    ogImage: '/og/work.png',
    jsonLd: buildWebPageSchema({
      url: 'https://n3wth.com/work',
      title: TITLE,
      description: DESCRIPTION,
      breadcrumbs: [
        { name: 'Home', url: 'https://n3wth.com/' },
        { name: 'Work', url: 'https://n3wth.com/work' },
      ],
    }),
  })

  return (
    <>
      <SectionHeader
        as="h1"
        title="Work"
        lede="I lead AI product development at Google. Previously at Covariant, Meta, and Microsoft."
        action={
          <Button
            label="Open resume"
            variant="primary"
            size="md"
            href="https://r2.n3wth.com/resume/oliver-newth-resume.pdf"
          />
        }
      />
      <Experience />
    </>
  )
}
