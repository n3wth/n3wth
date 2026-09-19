const N = 72
const X0 = -20
const X1 = 1640
const FLOW = 1.0 // waver phase speed — ripples travel +x

function smooth(t: number) {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

export interface LightPathConfig {
  /** vertical center the path wavers around */
  baseline: number
  /** phase offsets for the two shared wavers, in radians */
  sharedPhase: readonly [number, number]
  /** separation envelope in [0, 1], as a function of t */
  envelope: (t: number) => number
  /** how far each branch pushes from the shared line at full envelope */
  spread: (dir: -1 | 1) => number
  /** phase offsets for each branch's own small waver, in radians */
  ownPhase: (dir: -1 | 1) => readonly [number, number]
}

/**
 * Builds the `buildPath` generator shared by ConvergeLight and ForkLight:
 * a wavering base line (two slow, incommensurate sines) overlaid with a
 * per-branch envelope-scaled separation and its own small waver. Only the
 * envelope shape, spread, baseline and phase offsets differ between the
 * two drawings — the underlying waveform algorithm is identical.
 */
export function buildLightPath(config: LightPathConfig) {
  const [shared0, shared1] = config.sharedPhase
  return function buildPath(dir: -1 | 1, time: number): string {
    const pts: string[] = []
    for (let i = 0; i <= N; i++) {
      const t = i / N
      const x = X0 + (X1 - X0) * t
      const shared =
        Math.sin(t * 5.1 + shared0 - time * FLOW) * 3.2 +
        Math.sin(t * 11.7 + shared1 - time * FLOW * 1.7) * 1.3
      const env = config.envelope(t)
      const spread = config.spread(dir)
      const [own0, own1] = config.ownPhase(dir)
      const own =
        (Math.sin(t * 7.3 + own0 - time * FLOW * 1.3) * 2.6 +
          Math.sin(t * 15.9 + own1 - time * FLOW * 2.1) * 1.1) *
        env
      const y = config.baseline + shared + dir * env * spread + own
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    }
    return pts.join(' ')
  }
}

export function smoothEnvelope(t: number) {
  return smooth(t)
}
