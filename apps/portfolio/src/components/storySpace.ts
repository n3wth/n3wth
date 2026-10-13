const storageKey = 'n3wth-story-journey'
export const storyEnergy = (time: number) => .12 + .88 * (.5 + .28 * Math.cos(time * .09) + .22 * Math.cos(time * .047 + 1)) ** 2
export const storyChaos = (time: number) => Math.max(0, Math.sin(time * .067 + 1)) ** 2
export function storyColor(time: number, offset = 0) {
  const palette = ['cyan', 'green', 'yellow', 'red']
  const phase = ((time / 38 + offset) % 4 + 4) % 4
  const index = Math.floor(phase), fraction = phase - index
  const blend = fraction * fraction * (3 - 2 * fraction)
  return `color-mix(in srgb, var(--color-icon-${palette[index]}) ${(1 - blend) * 100}%, var(--color-icon-${palette[(index + 1) % 4]}))`
}
export function pulseEnvelope(t: number, smoothing: number) {
  const smooth = (n: number) => { const x = Math.max(0, Math.min(1, n)); return x * x * (3 - 2 * x) }
  return smooth(t / (.16 + smoothing * .24)) * (1 - smooth((t - (.7 - smoothing * .12)) / (.3 + smoothing * .12)))
}
const profiles: Record<string, { speed: number; gap: number; chorus: number }> = {
  art: { speed: 1, gap: 1.4, chorus: .25 },
  thinking: { speed: 1.4, gap: 2, chorus: .08 },
  work: { speed: .8, gap: 1.6, chorus: .1 },
  projects: { speed: .7, gap: 1.2, chorus: .15 },
  library: { speed: 1.5, gap: 2.8, chorus: .04 },
  contact: { speed: 1.1, gap: 1.8, chorus: .18 },
}

/** A tab-local clock and palette connect the scenes without changing navigation. */
let documentJourney: { epoch: number; color: number } | undefined
export function readStoryJourney() {
  if (documentJourney) return documentJourney
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  try {
    const value = JSON.parse(sessionStorage.getItem(storageKey) || 'null')
    if (navigation?.type !== 'reload' && Number.isFinite(value?.epoch) && Number.isFinite(value?.color)) {
      documentJourney = value as { epoch: number; color: number }
      return documentJourney
    }
  } catch { /* Storage is optional. */ }
  documentJourney = { epoch: Date.now() - Math.random() * 600000, color: Math.floor(Math.random() * 4) }
  return documentJourney
}

export function saveStoryJourney(journey: { epoch: number; color: number }) {
  try { sessionStorage.setItem(storageKey, JSON.stringify(journey)) } catch { /* Private browsing remains usable. */ }
}

/** Fixed geometry; light travels through the stack and shades each solid face. */
export function createStorySpace(svg: SVGSVGElement, kind: string, amount: number, smoothing: number) {
  const faces = [...svg.querySelectorAll<SVGPathElement>('[data-story-face]')]
  const palette = ['cyan', 'green', 'yellow', 'red']
  const ink = (index: number) => `var(--color-icon-${palette[index]})`
  type Light = { start: number; duration: number; color: string; coordinated: boolean }
  const lights = Array.from({ length: 9 }, () => ({ next: 0, events: [] as Light[] }))
  const strength = (light: Light, time: number) => {
    const age = (time - light.start) / light.duration
    return age > 0 && age < 1 ? (light.coordinated ? pulseEnvelope(age, smoothing) : Math.sin(age * Math.PI) ** 2) : 0
  }
  let initialized = false
  let orderedUntil = 0
  const reset = () => {
    svg.style.filter = ''
    faces.forEach(face => { face.style.fill = 'none'; face.style.stroke = 'none' })
  }
  reset()
  return {
    profile: profiles[kind] ?? profiles.art,
    startPattern(time: number, duration: number, color: string, stagger: number, blocks: Set<number>, chaos: number) {
      lights.forEach((light, index) => {
        if (!blocks.has(index)) return
        const independent = ink(index * 3 % palette.length)
        const tint = chaos > .001 ? `color-mix(in srgb, ${color} ${(1 - chaos) * 100}%, ${independent})` : color
        light.events.push({ start: time + index / 8 * stagger, duration, color: tint, coordinated: true })
      })
      orderedUntil = time + stagger + duration
      lights.forEach(light => { light.next = orderedUntil + 1 + Math.random() * 4 })
    },
    colorFor(path: SVGPathElement, time: number, planned = false) {
      const block = path.closest<SVGGElement>('[data-story-block]')
      if (!block) return null
      const events = lights[Number(block.dataset.storyBlock)].events
      if (planned) return events.at(-1)?.color ?? null
      const active = events.filter(light => strength(light, time) > .05)
      active.sort((a, b) => strength(b, time) - strength(a, time))
      return active[0]?.color ?? null
    },
    update(time: number) {
      const energy = storyEnergy(time)
      const inversion = Math.max(0, (Math.sin(time * .043 - 1.5) - .55) / .45) ** 2
      svg.style.filter = inversion > .001 ? `invert(${inversion}) hue-rotate(${inversion * 30}deg)` : ''
      if (!initialized) {
        lights.forEach(light => { light.next = time + Math.random() * 5 })
        initialized = true
      }
      lights.forEach(light => {
        light.events = light.events.filter(event => time < event.start + event.duration)
        if (time < orderedUntil || time < light.next) return
        const duration = 1.8 + Math.random() * 2.7
        light.next = time + duration + 3 + Math.random() * 7 + (1 - energy) * 10
        const chaos = storyChaos(time)
        const color = `color-mix(in srgb, ${storyColor(time)} ${(1 - chaos) * 100}%, ${ink(Math.floor(Math.random() * palette.length))})`
        light.events.push({ start: time, duration, color, coordinated: false })
      })
      faces.forEach(face => {
        const layer = Number(face.dataset.storyFace)
        const shade = Number(face.dataset.faceShade)
        let total = 0, color = ink(0)
        for (const light of lights[layer].events) {
          const weight = strength(light, time)
          if (!weight) continue
          color = total ? `color-mix(in srgb, ${color} ${total / (total + weight) * 100}%, ${light.color})` : light.color
          total += weight
        }
        face.style.fill = color
        face.style.fillOpacity = String(Math.min(1, total) * amount * shade)
      })
    },
    reset,
    dispose: reset,
  }
}
