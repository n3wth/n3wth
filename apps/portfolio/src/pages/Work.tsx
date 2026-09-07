import { Experience } from '../components/sections/Experience'
import { Building } from '../components/sections/Building'
import { EmergenceField } from '../components/EmergenceField'
import { SectionHeader } from '../components/Frame'
import { usePageMeta, buildWebPageSchema } from '../hooks/usePageMeta'

const TITLE = 'Work — Oliver Newth'
const DESCRIPTION = 'Independent AI projects by Oliver Newth and product roles at Google, Covariant, Meta, and Microsoft.'

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
      <SectionHeader as="h1" title="Work" lede="I choose a problem, build an early version, and put it in front of people. What I learn shapes what comes next." />
      <Building />
      {/* A dot grid dissolving into constellations — hand-designed order
          becoming agent-shipped emergence, between the two halves of the
          story. Procedural vector: reveals left to right, the emergent
          side drifting and twinkling. (data-reveal on the inner div: its
          transform would override .bleed's translateX(-50%) centering) */}
      <div className="bleed" aria-hidden>
        <div data-reveal className="w-full" style={{ height: 'clamp(200px, 38svh, 380px)' }}>
          <EmergenceField />
        </div>
      </div>
      <Experience />
    </>
  )
}
