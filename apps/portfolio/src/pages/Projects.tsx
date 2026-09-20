import { Building } from '../components/sections/Building'
import { SectionHeader } from '../components/Frame'
import { usePageMeta, buildWebPageSchema } from '../hooks/usePageMeta'

const TITLE = 'Projects — Oliver Newth'
const DESCRIPTION = 'Independent projects by Oliver Newth: tools for AI agents, a shared component library, and other experiments.'

export default function Projects() {
  usePageMeta(TITLE, DESCRIPTION, {
    canonical: '/projects',
    ogImage: '/og/work.png',
    jsonLd: buildWebPageSchema({
      url: 'https://n3wth.com/projects',
      title: TITLE,
      description: DESCRIPTION,
      breadcrumbs: [
        { name: 'Home', url: 'https://n3wth.com/' },
        { name: 'Projects', url: 'https://n3wth.com/projects' },
      ],
    }),
  })

  return <>
    <SectionHeader as="h1" title="Projects" lede="Tools for AI agents, a shared component library, and other experiments." />
    <Building />
  </>
}
