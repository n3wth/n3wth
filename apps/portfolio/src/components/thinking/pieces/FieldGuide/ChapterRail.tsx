import { useRef, useState } from 'react'
import { gsap, useGSAP, ScrollTrigger } from '../../../../lib/scroll'

/**
 * Fixed chapter rail: three roman numerals beside a hairline that fills
 * with reading progress. Only shows at >=1440px, where the viewport is
 * wide enough that the 1280px frame leaves real margin to stand in.
 * Clicking a numeral scrolls to that chapter (instant under reduced
 * motion). The fill is written with gsap.set from onUpdate — no React
 * state on the scroll path.
 */

export interface RailChapter {
  id: string
  numeral: string
  title: string
}

export function ChapterRail({
  chapters,
  reduced,
}: {
  chapters: RailChapter[]
  reduced: boolean
}) {
  const rootRef = useRef<HTMLElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const [active, setActive] = useState<string | null>(null)

  const { contextSafe } = useGSAP(
    () => {
      const article = document.getElementById('field-guide-article')
      if (!article) return

      ScrollTrigger.create({
        trigger: article,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          if (fillRef.current) gsap.set(fillRef.current, { scaleY: self.progress })
        },
      })

      for (const ch of chapters) {
        const el = document.getElementById(ch.id)
        if (!el) continue
        ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => {
            if (self.isActive) setActive(ch.id)
          },
        })
      }
    },
    { scope: rootRef, dependencies: [chapters, reduced], revertOnUpdate: true }
  )

  const jump = contextSafe((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    gsap.to(window, {
      scrollTo: { y: el, offsetY: 24 },
      duration: reduced ? 0 : 0.9,
      ease: 'power2.inOut',
      overwrite: 'auto',
    })
  })

  return (
    <nav
      ref={rootRef}
      aria-label="Chapters"
      className="fixed left-5 top-1/2 z-20 hidden -translate-y-1/2 min-[1440px]:block"
    >
      <div className="flex items-stretch gap-3">
        <span aria-hidden className="relative block w-px" style={{ background: 'var(--rail)' }}>
          <span
            ref={fillRef}
            className="absolute inset-0 origin-top"
            style={{ background: 'var(--accent-rail)', transform: 'scaleY(0)' }}
          />
        </span>
        <ol className="flex flex-col gap-6 py-1">
          {chapters.map((ch) => (
            <li key={ch.id}>
              <button
                type="button"
                onClick={() => jump(ch.id)}
                aria-current={active === ch.id ? 'true' : undefined}
                title={ch.title}
                className="index block min-h-11 min-w-11 text-left transition-colors duration-300"
                style={{ color: active === ch.id ? 'var(--ink)' : 'var(--ink-faint)' }}
              >
                {ch.numeral}
                <span className="sr-only"> — {ch.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
