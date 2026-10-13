/** Route light between the actual crossings with Art's uppermost current. */
export function createArtRoutes(svg: SVGSVGElement) {
  const wave = svg.querySelector<SVGPathElement>('[data-art-current]')
  if (!wave) return []
  const length = wave.getTotalLength()
  const samples = Array.from({ length: 4097 }, (_, i) => wave.getPointAtLength(length * i / 4096))
  const heightAt = (x: number) => {
    let low = 0, high = samples.length - 1
    while (high - low > 1) {
      const mid = (low + high) >> 1
      if (samples[mid].x < x) low = mid
      else high = mid
    }
    const a = samples[low], b = samples[high]
    return a.y + (b.y - a.y) * (x - a.x) / (b.x - a.x)
  }
  const routes: SVGPathElement[] = []
  svg.querySelectorAll<SVGPathElement>('[data-art-loop], [data-story-halo-loop]').forEach(loop => {
    const total = loop.getTotalLength()
    const count = Math.ceil(total / 2)
    const distance = (at: number) => {
      const p = loop.getPointAtLength(at)
      return p.y - heightAt(p.x)
    }
    const hits: number[] = []
    for (let i = 1; i <= count; i++) {
      let a = (i - 1) / count * total, b = i / count * total
      if (distance(a) * distance(b) >= 0) continue
      const sign = distance(a) > 0
      for (let step = 0; step < 16; step++) {
        const mid = (a + b) / 2
        if ((distance(mid) > 0) === sign) a = mid
        else b = mid
      }
      hits.push((a + b) / 2)
    }
    if (hits.length !== 2) return
    ;[[hits[1], hits[0] + total], [hits[0], hits[1]]].forEach(([start, end], index) => {
      const steps = Math.ceil((end - start) / 2)
      const points = Array.from({ length: steps + 1 }, (_, i) => loop.getPointAtLength((start + (end - start) * i / steps) % total))
      const route = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      route.dataset.artRoute = index ? 'reflection' : 'arch'
      if (loop.dataset.storyHaloLoop) {
        route.dataset.storyHalo = loop.dataset.storyHaloLoop
        route.setAttribute('pathLength', '1')
      }
      route.setAttribute('d', points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(3)} ${p.y.toFixed(3)}`).join(' '))
      route.style.opacity = '0'
      loop.parentElement!.appendChild(route)
      routes.push(route)
    })
  })
  return routes
}
