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
      {/* A dot grid dissolving into constellations — hand-designed order
          becoming agent-shipped emergence, between the two halves of the
          story. (data-reveal on the img: its transform would override
          .bleed's translateX(-50%) centering) */}
      <div className="bleed" aria-hidden>
        <img
          data-reveal
          src="/images/work-weave.webp"
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full object-cover"
          style={{ height: 'clamp(200px, 38svh, 380px)' }}
        />
      </div>
      <Building />
    </>
  )
}
