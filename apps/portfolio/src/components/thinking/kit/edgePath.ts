/** A gentle bezier arc from a to b, offset perpendicular to the straight
 * line between them so the curve reads as organic even when the two
 * points share a y (a straight chain would otherwise stay dead flat).
 * Shared by FlowDiagram and any bespoke SVG that wants the same
 * flowing-line language for its own node/edge layout. */
export function buildEdgePath(ax: number, ay: number, bx: number, by: number, index: number): string {
  const dx = bx - ax
  const dy = by - ay
  const dist = Math.hypot(dx, dy) || 1
  const px = -dy / dist
  const py = dx / dist
  const dir = index % 2 === 0 ? 1 : -1
  const bulge = Math.min(dist * 0.22, 30) * dir
  const c1x = ax + dx * 0.32 + px * bulge
  const c1y = ay + dy * 0.32 + py * bulge
  const c2x = ax + dx * 0.68 + px * bulge
  const c2y = ay + dy * 0.68 + py * bulge
  return `M ${ax.toFixed(1)} ${ay.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${bx.toFixed(1)} ${by.toFixed(1)}`
}
