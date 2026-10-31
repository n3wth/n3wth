/** Signature silhouettes for the six section routes.
 * Each route is a circle, an arc, and a blob. Every layer uses the same
 * eight-cubic outline so one route can morph into the next. */

const TAU = Math.PI * 2

export const storyKinds = ['work', 'art', 'thinking', 'projects', 'library', 'contact'] as const
export type StoryKind = (typeof storyKinds)[number]
export type ShapeScales = readonly [number, number, number, number, number, number, number, number]

export interface ShapeLayer {
  cx: number
  cy: number
  rx: number
  ry: number
  rotate: number
  start: number
  sweep: number
  inner: number
  scales: ShapeScales
}

export interface RouteShape {
  circle: ShapeLayer
  arc: ShapeLayer
  blob: ShapeLayer
}

const ONES: ShapeScales = [1, 1, 1, 1, 1, 1, 1, 1]
const SEGMENTS = 8

function layer(values: Pick<ShapeLayer, 'cx' | 'cy' | 'rx'> & Partial<ShapeLayer>): ShapeLayer {
  return {
    cx: values.cx,
    cy: values.cy,
    rx: values.rx,
    ry: values.ry ?? values.rx,
    rotate: values.rotate ?? 0,
    start: values.start ?? -Math.PI / 2,
    sweep: values.sweep ?? TAU,
    inner: values.inner ?? 0,
    scales: values.scales ?? ONES,
  }
}

export const routeShapes: Record<StoryKind, RouteShape> = {
  // Horizontal planes: a wide band, a shallow arc, and a lower stratum.
  work: {
    circle: layer({ cx: 120, cy: 72, rx: 96, ry: 16 }),
    arc: layer({ cx: 120, cy: 118, rx: 84, ry: 26, start: Math.PI, sweep: Math.PI, inner: 0.48 }),
    blob: layer({ cx: 120, cy: 168, rx: 70, ry: 18, scales: [1.08, 0.84, 1.14, 0.9, 1.06, 0.8, 1.12, 0.88] }),
  },
  // Crown, arch, and the reflection under it.
  art: {
    circle: layer({ cx: 120, cy: 36, rx: 16 }),
    arc: layer({ cx: 120, cy: 118, rx: 64, ry: 72, start: Math.PI, sweep: Math.PI, inner: 0.68 }),
    blob: layer({ cx: 120, cy: 206, rx: 62, ry: 12, scales: [1.04, 0.72, 1.1, 0.68, 1.06, 0.74, 1.08, 0.7] }),
  },
  // Bud, canopy, and the mass of the tree.
  thinking: {
    circle: layer({ cx: 120, cy: 34, rx: 12 }),
    arc: layer({ cx: 120, cy: 86, rx: 92, ry: 32, start: Math.PI, sweep: Math.PI, inner: 0.56 }),
    blob: layer({ cx: 120, cy: 156, rx: 50, ry: 48, rotate: 0.2, scales: [0.7, 1.08, 1.26, 0.92, 0.58, 0.96, 1.2, 0.8] }),
  },
  // The reference stack: circle, arc, and blob, kept far enough apart to read.
  projects: {
    circle: layer({ cx: 172, cy: 70, rx: 30 }),
    arc: layer({ cx: 92, cy: 118, rx: 68, start: Math.PI * 0.78, sweep: Math.PI * 1.15, inner: 0.66 }),
    blob: layer({ cx: 158, cy: 168, rx: 42, ry: 34, rotate: 0.45, scales: [1.16, 0.8, 1.3, 0.9, 1.1, 0.72, 1.24, 0.86] }),
  },
  // Binding, page edge, and a turned leaf.
  library: {
    circle: layer({ cx: 52, cy: 156, rx: 14 }),
    arc: layer({ cx: 148, cy: 108, rx: 58, ry: 40, rotate: -0.45, start: Math.PI * 1.1, sweep: Math.PI * 0.9, inner: 0.6 }),
    blob: layer({ cx: 140, cy: 132, rx: 52, ry: 64, rotate: -0.4, scales: [0.48, 0.9, 1.14, 1.2, 0.74, 1.04, 1.12, 0.52] }),
  },
  // Two bodies and the arc that joins them.
  contact: {
    circle: layer({ cx: 58, cy: 120, rx: 30 }),
    arc: layer({ cx: 120, cy: 118, rx: 40, ry: 22, start: Math.PI * 1.15, sweep: Math.PI * 0.7, inner: 0.55 }),
    blob: layer({ cx: 182, cy: 120, rx: 32, ry: 40, scales: [1.1, 0.82, 1.22, 0.9, 1.08, 0.76, 1.18, 0.88] }),
  },
}

export function storyKindFromPath(pathname: string): StoryKind | null {
  const path = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  const name = path.slice(1)
  return (storyKinds as readonly string[]).includes(name) ? name as StoryKind : null
}

interface Sample {
  x: number
  y: number
  tx: number
  ty: number
}

function format(value: number) {
  const rounded = Math.round(value * 1000) / 1000
  return Object.is(rounded, -0) ? '0' : String(rounded)
}

function sample(shape: ShapeLayer, index: number, radius: number): Sample {
  const scale = shape.scales[index % SEGMENTS]
  const angle = shape.start + shape.sweep * (index / SEGMENTS)
  const rx = shape.rx * scale * radius
  const ry = shape.ry * scale * radius
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const localX = rx * cos
  const localY = ry * sin
  const localTx = -rx * sin
  const localTy = ry * cos
  const rotCos = Math.cos(shape.rotate)
  const rotSin = Math.sin(shape.rotate)
  return {
    x: shape.cx + localX * rotCos - localY * rotSin,
    y: shape.cy + localX * rotSin + localY * rotCos,
    tx: localTx * rotCos - localTy * rotSin,
    ty: localTx * rotSin + localTy * rotCos,
  }
}

function curve(from: Sample, to: Sample, kappa: number) {
  return `C ${format(from.x + from.tx * kappa)} ${format(from.y + from.ty * kappa)} ${format(to.x - to.tx * kappa)} ${format(to.y - to.ty * kappa)} ${format(to.x)} ${format(to.y)}`
}

/** Closed outline. Full disks collapse the inner ring to the center. */
export function layerPath(shape: ShapeLayer) {
  const outer = Array.from({ length: SEGMENTS + 1 }, (_, index) => sample(shape, index, 1))
  if (Math.abs(shape.sweep - TAU) < 0.001) outer[SEGMENTS] = outer[0]
  const kappa = (4 / 3) * Math.tan(shape.sweep / SEGMENTS / 4)
  const commands = [`M ${format(outer[0].x)} ${format(outer[0].y)}`]
  for (let index = 0; index < SEGMENTS; index++) commands.push(curve(outer[index], outer[index + 1], kappa))
  // Disks close on the outer ring. Arcs return along an inner ring so the opening stays.
  if (shape.inner >= 0.001) {
    const inner = Array.from({ length: SEGMENTS + 1 }, (_, index) => sample(shape, index, shape.inner))
    commands.push(curve(outer[SEGMENTS], inner[SEGMENTS], 0))
    for (let index = SEGMENTS; index > 0; index--) commands.push(curve(inner[index], inner[index - 1], kappa))
  }
  commands.push('Z')
  return commands.join(' ')
}

export function lerpLayer(from: ShapeLayer, to: ShapeLayer, amount: number): ShapeLayer {
  const mix = (start: number, end: number) => start + (end - start) * amount
  return {
    cx: mix(from.cx, to.cx),
    cy: mix(from.cy, to.cy),
    rx: mix(from.rx, to.rx),
    ry: mix(from.ry, to.ry),
    rotate: mix(from.rotate, to.rotate),
    start: mix(from.start, to.start),
    sweep: mix(from.sweep, to.sweep),
    inner: mix(from.inner, to.inner),
    scales: [
      mix(from.scales[0], to.scales[0]),
      mix(from.scales[1], to.scales[1]),
      mix(from.scales[2], to.scales[2]),
      mix(from.scales[3], to.scales[3]),
      mix(from.scales[4], to.scales[4]),
      mix(from.scales[5], to.scales[5]),
      mix(from.scales[6], to.scales[6]),
      mix(from.scales[7], to.scales[7]),
    ],
  }
}

export function easeOutCubic(amount: number) {
  const t = Math.min(1, Math.max(0, amount))
  return 1 - (1 - t) ** 3
}

export const routeLayers = ['blob', 'arc', 'circle'] as const
export type RouteLayer = (typeof routeLayers)[number]

export function routePaths(shape: RouteShape) {
  return {
    blob: layerPath(shape.blob),
    arc: layerPath(shape.arc),
    circle: layerPath(shape.circle),
  }
}
