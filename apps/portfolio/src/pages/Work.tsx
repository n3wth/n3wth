import { Experience } from '../components/sections/Experience'
import { SectionHeader } from '../components/Frame'
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
          <a
            href="https://r2.n3wth.com/resume/oliver-newth-resume.pdf"
            className="inline-flex min-h-11 w-fit shrink-0 items-center gap-2 underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            aria-label="Resume (PDF)"
          >
            Resume (PDF)
          </a>
        }
      />
      <Experience />
    </>
  )
}
