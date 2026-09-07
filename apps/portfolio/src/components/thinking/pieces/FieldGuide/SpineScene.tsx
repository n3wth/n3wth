import { useRef } from 'react'
import { gsap, useGSAP } from '../../../../lib/scroll'

/**
 * Set piece one: Kenn Adams' story spine, run on the real story behind
 * this site. Pinned; scroll scrubs through the seven lines with a snap
 * to each label, so the reader can't half-land between sentences. Under
 * reduced motion the whole spine renders as a plain stacked list —
 * nothing is lost but the choreography.
 */

const STEPS: { starter: string; line: string }[] = [
  { starter: 'Once upon a time', line: 'a product manager spent ten years shipping AI into other people’s products.' },
  { starter: 'Every day', line: 'the work went out under somebody else’s logo and vanished into a data center.' },
  { starter: 'But one day', line: 'he hauled steel and LED rope to the Black Rock Desert and built a pack of extinct animals out of light.' },
  { starter: 'Because of that', line: 'strangers walked out of the dark just to stand near them.' },
  { starter: 'Because of that', line: 'the projects got bigger: a pink triangle the whole city could see, a ring of light for World AIDS Day.' },
  { starter: 'Until finally', line: 'his front door stopped being a list of jobs and became that desert at night.' },
  { starter: 'And ever since', line: 'visitors don’t read the story. They walk into it.' },
]

export function SpineScene({ reduced }: { reduced: boolean }) {
  const rootRef = useRef<HTMLElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      if (reduced) return
      const root = rootRef.current
      if (!root) return
      const steps = gsap.utils.toArray<HTMLElement>('[data-spine-step]', root)
      if (!steps.length) return

      const mm = gsap.matchMedia()
      mm.add(
        { desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' },
        (ctx) => {
          const { mobile } = ctx.conditions as { mobile: boolean }

          // Step 0 is on stage when the pin catches; everything else waits.
          gsap.set(steps, { autoAlpha: 0, y: 28 })
          gsap.set(steps[0], { autoAlpha: 1, y: 0 })

          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            // The counter reads from the timeline, not the trigger:
            // trigger onUpdate stops firing once scrolling stops, but the
            // scrub keeps easing the playhead for up to a second after.
            onUpdate: () => {
              const label = tl.currentLabel() as string | null
              const i = label ? Number(label.slice(1)) : 0
              if (counterRef.current) {
                counterRef.current.textContent = `${String(i + 1).padStart(2, '0')} / ${String(STEPS.length).padStart(2, '0')}`
              }
            },
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: () => '+=' + Math.round(window.innerHeight * STEPS.length * (mobile ? 0.55 : 0.68)),
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              fastScrollEnd: true,
              snap: {
                snapTo: 'labels',
                duration: { min: 0.2, max: 0.5 },
                ease: 'power1.inOut',
                delay: 0.1,
              },
            },
          })

          steps.forEach((step, i) => {
            // Label sits mid-hold, after the enter completes, so snapping
            // always parks on a fully visible line — never a blank stage.
            tl.addLabel(`s${i}`, i + 0.4)
            if (i > 0) tl.fromTo(step, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.32 }, i)
            if (i < steps.length - 1) tl.to(step, { autoAlpha: 0, y: -24, duration: 0.28 }, i + 0.72)
          })
          // A short hold on the last line, then the pin releases.
          tl.to({}, { duration: 0.3 }, STEPS.length - 1 + 0.32)
        }
      )
      return () => mm.revert()
    },
    { scope: rootRef, dependencies: [reduced], revertOnUpdate: true }
  )

  if (reduced) {
    return (
      <section aria-label="The story spine, applied" className="py-10">
        <ol className="flex max-w-[62ch] flex-col gap-8">
          {STEPS.map((s) => (
            <li key={s.starter + s.line}>
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-faint)' }}>
                {s.starter}
              </p>
              <p className="display mt-2 text-[clamp(1.35rem,2.6vw,1.9rem)]" style={{ lineHeight: 1.15 }}>
                {s.line}
              </p>
            </li>
          ))}
        </ol>
      </section>
    )
  }

  return (
    <section
      ref={rootRef}
      aria-label="The story spine, applied"
      className="relative flex h-svh flex-col justify-center"
    >
      {/* Complete spine for assistive tech: the animated stack below
          keeps every line except the active one at visibility:hidden. */}
      <ol className="sr-only">
        {STEPS.map((s) => (
          <li key={s.starter + s.line}>
            {s.starter}, {s.line}
          </li>
        ))}
      </ol>
      <p aria-hidden className="absolute top-8 text-xs uppercase tracking-wide" style={{ color: 'var(--ink-faint)' }}>
        The story spine, one scroll per line
      </p>
      <div aria-hidden className="relative mx-auto w-full max-w-3xl" style={{ minHeight: '14rem' }}>
        {STEPS.map((s, i) => (
          <div key={i} data-spine-step className="absolute inset-x-0 top-0 will-change-transform">
            <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-faint)' }}>
              {s.starter}
            </p>
            <p
              className="display mt-3 text-[clamp(1.7rem,3.6vw,2.7rem)]"
              style={{ lineHeight: 1.12, textWrap: 'balance' }}
            >
              {s.line}
            </p>
          </div>
        ))}
      </div>
      <span
        ref={counterRef}
        aria-hidden
        className="meta absolute bottom-8 left-0"
        style={{ color: 'var(--ink-faint)' }}
      >
        01 / 07
      </span>
    </section>
  )
}
