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
      {/* A light path forking in the dark — the page's subject drawn once,
          between the positions and the trade-off walkthroughs. */}
      {/* data-reveal lives on the img, not the bleed wrapper — the reveal's
          transform would override .bleed's translateX(-50%) centering */}
      <div className="bleed" aria-hidden>
        <img
          data-reveal
          src="/images/thinking-fork.webp"
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full object-cover"
          style={{ height: 'clamp(220px, 42svh, 420px)' }}
        />
      </div>
      <AIExplainer />
    </>
  )
}
