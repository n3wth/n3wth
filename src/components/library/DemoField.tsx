import { AssembleField } from '../thinking/kit/AssembleField'

/**
 * AssembleField, running, at reading scale rather than band scale. Two
 * clusters and a small viewBox keep the gathering points inside the crop
 * on a 320px screen — the component slices rather than fits, so clusters
 * parked far to the right of a wide viewBox simply vanish on a phone.
 *
 * Module-level clusters array: AssembleField memoises its whole lattice
 * on the identity of this prop, so an inline literal would rebuild every
 * dot on every render.
 */
const CLUSTERS: [number, number][] = [
  [372, 66],
  [452, 150],
]

export default function DemoField() {
  return (
    <figure className="m-0">
      <div className="h-36 w-full max-w-xl overflow-hidden sm:h-40">
        <AssembleField
          seed={17}
          cols={26}
          rows={10}
          width={600}
          height={200}
          clusters={CLUSTERS}
          travelerCount={2}
        />
      </div>
      <figcaption className="mt-3 max-w-[62ch] text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
        The lattice keeps its rows on the left and stops holding them somewhere around the middle,
        which is the envelope doing its job. Both the shape and the drift are seeded, so this is the
        same field on every visit. The wide band a little further down the page is this component
        again, at four clusters and a different seed.
      </figcaption>
    </figure>
  )
}
