import { Thinking as Positions } from '../components/sections/Thinking'
import { AIExplainer } from '../components/sections/AIExplainer'
import { ForkLight } from '../components/ForkLight'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ThinkingPage() {
  usePageMeta(
    'Thinking — Oliver Newth',
    'Positions on production AI and agents as an org design problem, plus interactive walk-throughs of real AI safety trade-offs.'
  )

  return (
    <>
      <Positions />
      {/* A light path forking in the dark — the page's subject drawn once,
          between the positions and the trade-off walkthroughs. Vector, so
          it stays sharp and draws itself in on reveal. */}
      {/* data-reveal lives on the inner div, not the bleed wrapper — the
          reveal's transform would override .bleed's translateX(-50%) */}
      <div className="bleed" aria-hidden>
        <div data-reveal className="w-full" style={{ height: 'clamp(220px, 42svh, 420px)' }}>
          <ForkLight />
        </div>
      </div>
      <AIExplainer />
    </>
  )
}
