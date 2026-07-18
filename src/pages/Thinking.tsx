import { Thinking as Positions } from '../components/sections/Thinking'
import { AIExplainer } from '../components/sections/AIExplainer'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ThinkingPage() {
  usePageMeta(
    'Thinking — Oliver Newth',
    'Positions on production AI and agents as an org design problem, plus interactive walk-throughs of real AI safety trade-offs.'
  )

  return (
    <>
      <Positions />
      <AIExplainer />
    </>
  )
}
