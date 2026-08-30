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
    </>
  )
}
