import { Creative } from '../components/sections/Creative'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Art() {
  usePageMeta(
    'After dark — Oliver Newth',
    'Large-scale light installations for Burning Man and San Francisco memorials — THEM, Pink Triangle, and Circle of Light.'
  )

  return <Creative />
}
