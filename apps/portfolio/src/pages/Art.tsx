import { Creative } from '../components/sections/Creative'
import { usePageMeta, buildWebPageSchema } from '../hooks/usePageMeta'

const TITLE = 'After dark — Oliver Newth'
const DESCRIPTION = 'Large-scale light installations for Burning Man and San Francisco memorials. THEM, Pink Triangle, and Circle of Light.'

export default function Art() {
  usePageMeta(TITLE, DESCRIPTION, {
    ogImage: '/og/art.png',
    jsonLd: buildWebPageSchema({
      url: 'https://n3wth.com/art',
      title: TITLE,
      description: DESCRIPTION,
      breadcrumbs: [
        { name: 'Home', url: 'https://n3wth.com/' },
        { name: 'Art', url: 'https://n3wth.com/art' },
      ],
    }),
  })

  return <Creative />
}
