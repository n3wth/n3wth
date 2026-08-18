import { Button } from '@astryxdesign/core/Button'
import { Experience } from '../components/sections/Experience'
import { Building } from '../components/sections/Building'
import { EmergenceField } from '../components/EmergenceField'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Work() {
  usePageMeta(
    'Work — Oliver Newth',
    'Twelve years of AI in production across Google, Covariant, Meta, and Microsoft — and five products designed by hand, shipped by agents.'
  )

  return (
    <>
      <Experience />
      {/* A dot grid dissolving into constellations — hand-designed order
          becoming agent-shipped emergence, between the two halves of the
          story. Procedural vector: reveals left to right, the emergent
          side drifting and twinkling. (data-reveal on the inner div: its
          transform would override .bleed's translateX(-50%) centering) */}
      <div className="bleed" aria-hidden>
        <div data-reveal className="w-full" style={{ height: 'clamp(200px, 38svh, 380px)' }}>
          <EmergenceField />
        </div>
      </div>
      <Building />
      {/* Closing coda, matching /art's: the page a recruiter reads most
          shouldn't end cold on a project grid. */}
      <div data-reveal className="section-pad pad-air !pt-10 md:!pt-14 flex flex-col items-center text-center">
        <p
          className="display max-w-2xl text-[clamp(1.4rem,2.8vw,2.1rem)] mb-8"
          style={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}
        >
          The next system is already on the bench.
        </p>
        <Button label="Get in touch" variant="primary" href="/contact" />
      </div>
    </>
  )
}
