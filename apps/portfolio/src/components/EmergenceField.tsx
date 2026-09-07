import { AssembleField } from './thinking/kit/AssembleField'

const CLUSTERS: [number, number][] = [
  [1128, 62],
  [1286, 234],
  [1430, 46],
  [1348, 356],
  [1528, 176],
]

/**
 * Hand-designed order becoming emergence: a true dot lattice on the
 * left that loses its grid along an easing envelope, the freed dots
 * pulled into constellation clusters with faint connecting wisps.
 * Everything is seeded — the same field every visit — and the motion
 * flows left to right: the reveal staggers across, and the emergent
 * dots drift on a phase wave that travels in the direction of the
 * dissolve. Reduced motion shows the finished field, still.
 */
export function EmergenceField() {
  return <AssembleField seed={0} cols={46} rows={12} width={1600} height={400} clusters={CLUSTERS} travelerCount={3} />
}
