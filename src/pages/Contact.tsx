import { Contact } from '../components/sections/Contact'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ContactPage() {
  usePageMeta(
    'Contact — Oliver Newth',
    "Get in touch — AI safety or LED art. Coffee if you're in San Francisco."
  )

  return <Contact />
}
