import { AssembleField } from '../thinking/kit/AssembleField'

/**
 * /library's decorative band, and a small joke that pays rent: it's the
 * kit's own AssembleField, so the page documenting the kit is also drawn
 * by it. Four clusters, one per property, with the lattice on the left
 * giving way as it travels toward them.
 *
 * The viewBox is 900x400 rather than the 1600x400 /work uses. AssembleField
 * slices rather than fits, and at 1600 wide a phone crops away everything
 * past roughly x=1200, which is exactly where the clusters would be. At
 * 900 the gathering points survive down to 320px.
 *
 * data-reveal sits on the inner div, never on .bleed — the reveal's
 * transform would cancel .bleed's translateX(-50%) centering.
 */

const CLUSTERS: [number, number][] = [
  [530, 132],
  [645, 284],
  [762, 158],
  [850, 262],
]

export function AssembleBand() {
  return (
    <div className="bleed mt-16 md:mt-24" aria-hidden>
      <div data-reveal className="w-full" style={{ height: 'clamp(190px, 34svh, 340px)' }}>
        <AssembleField
          seed={4}
          cols={30}
          rows={12}
          width={900}
          height={400}
          clusters={CLUSTERS}
          travelerCount={4}
        />
      </div>
    </div>
  )
}
