import { Experience } from '../components/sections/Experience'
import { Building } from '../components/sections/Building'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Work() {
  usePageMeta(
    'Work — Oliver Newth',
    'A decade of AI in production across Google, Covariant, Meta, and Microsoft — and five products designed by hand, shipped by agents.'
  )

  return (
    <>
      <Experience />
      <Building />
    </>
  )
}
