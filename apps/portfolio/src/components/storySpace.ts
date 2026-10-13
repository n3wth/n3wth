const storageKey = 'n3wth-story-journey'
export function pulseEnvelope(t: number, smoothing: number) {
  const smooth = (n: number) => { const x = Math.max(0, Math.min(1, n)); return x * x * (3 - 2 * x) }
  return smooth(t / (.04 + smoothing * .2)) * (1 - smooth((t - (.88 - smoothing * .28)) / (.12 + smoothing * .28)))
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
export function readStoryJourney() {
  try {
    const value = JSON.parse(sessionStorage.getItem(storageKey) || 'null')
    if (Number.isFinite(value?.epoch) && Number.isFinite(value?.color)) return value as { epoch: number; color: number }
  } catch { /* Storage is optional. */ }
  return { epoch: Date.now(), color: 0 }
}

export function saveStoryJourney(journey: { epoch: number; color: number }) {
  try { sessionStorage.setItem(storageKey, JSON.stringify(journey)) } catch { /* Private browsing remains usable. */ }
}

/** Fixed geometry; light travels through the stack and shades each solid face. */
export function createStorySpace(svg: SVGSVGElement, kind: string, amount: number, smoothing: number) {
  const faces = [...svg.querySelectorAll<SVGPathElement>('[data-story-face]')]
  const palette = ['cyan', 'green', 'yellow', 'red']
  const ink = (index: number) => `var(--color-icon-${palette[index]})`
  const lights = Array.from({ length: 9 }, () => ({ start: -1, duration: 1, next: 0, color: ink(0) }))
  let initialized = false
  let orderedUntil = 0
  const reset = () => faces.forEach(face => { face.style.fill = 'none'; face.style.stroke = 'none' })
  reset()
  return {
    profile: profiles[kind] ?? profiles.art,
    startPattern(time: number, duration: number, color: string, stagger: number) {
      lights.forEach((light, index) => {
        light.start = time + index / 8 * stagger
        light.duration = duration
        light.color = color
      })
      orderedUntil = time + stagger + duration
      lights.forEach(light => { light.next = orderedUntil + 1 + Math.random() * 4 })
    },
    colorFor(path: SVGPathElement, time: number) {
      const block = path.closest<SVGGElement>('[data-story-block]')
      if (!block) return null
      const light = lights[Number(block.dataset.storyBlock)]
      return time >= light.start && time < light.start + light.duration ? light.color : null
    },
    update(time: number) {
      if (!initialized) {
        lights.forEach(light => { light.next = time + Math.random() * 5 })
        initialized = true
      }
      lights.forEach(light => {
        if (time < orderedUntil || time < light.next) return
        light.start = time
        light.duration = 1.8 + Math.random() * 2.7
        light.next = time + light.duration + 1.5 + Math.random() * 7
        light.color = ink(Math.floor(Math.random() * palette.length))
      })
      faces.forEach(face => {
        const layer = Number(face.dataset.storyFace)
        const shade = Number(face.dataset.faceShade)
        const light = lights[layer]
        const age = (time - light.start) / light.duration
        const strength = age > 0 && age < 1 ? (time < orderedUntil ? pulseEnvelope(age, smoothing) : Math.sin(age * Math.PI) ** 2) * amount * shade : 0
        face.style.fill = light.color
        face.style.fillOpacity = String(strength)
      })
    },
    reset,
    dispose: reset,
  }
}
