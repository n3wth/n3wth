import { Contact } from '../components/sections/Contact'
import { usePageMeta, buildWebPageSchema } from '../hooks/usePageMeta'

const TITLE = 'Contact — Oliver Newth'
const DESCRIPTION = "Get in touch — product, AI safety, or LED art. Coffee if you're in San Francisco."

export default function ContactPage() {
  usePageMeta(TITLE, DESCRIPTION, {
    ogImage: '/og/contact.png',
    jsonLd: buildWebPageSchema({
      url: 'https://n3wth.com/contact',
      title: TITLE,
      description: DESCRIPTION,
      breadcrumbs: [
        { name: 'Home', url: 'https://n3wth.com/' },
        { name: 'Contact', url: 'https://n3wth.com/contact' },
      ],
    }),
  })

  return <Contact />
}
