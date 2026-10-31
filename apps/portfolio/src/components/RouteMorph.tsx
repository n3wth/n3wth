import { routeLayers, routePaths, routeShapes, type StoryKind } from '../lib/routeShapes'

/** Flat signature for one section. The transition script morphs these paths. */
export function RouteMorph({ kind }: { kind: StoryKind }) {
  const paths = routePaths(routeShapes[kind])
  return (
    <svg
      className="route-morph"
      data-route-morph={kind}
      viewBox="0 0 240 240"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {routeLayers.map(layer => <path key={layer} data-route-layer={layer} d={paths[layer]} />)}
    </svg>
  )
}
