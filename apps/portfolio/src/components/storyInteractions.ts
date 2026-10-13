import { useEffect, type RefObject } from 'react'

type Point = { x: number; y: number }

/** Return the contact's position on the receiving segment, including near touches. */
export function segmentContact(a: Point, b: Point, c: Point, d: Point, radius = 2): number | null {
  const rx = b.x - a.x, ry = b.y - a.y
  const sx = d.x - c.x, sy = d.y - c.y
  const cross = rx * sy - ry * sx
  if (Math.abs(cross) > 1e-8) {
    const t = ((c.x - a.x) * sy - (c.y - a.y) * sx) / cross
    const u = ((c.x - a.x) * ry - (c.y - a.y) * rx) / cross
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return u
  }
  const length = sx * sx + sy * sy
  const u = length ? Math.max(0, Math.min(1, ((b.x - c.x) * sx + (b.y - c.y) * sy) / length)) : 0
  return Math.hypot(b.x - c.x - u * sx, b.y - c.y - u * sy) <= radius ? u : null
}

type Line = { path: SVGPathElement; points: DOMPoint[]; length: number; cooldown: number }
type Trail = { previous?: Point; position: number; direction: number; width: number; visited: Set<Line>; depth: number; spawned: boolean }
type Transfer = Trail & { path: SVGPathElement; echoes: SVGPathElement[]; phase: number; line: Line; start: number; end: number; born: number; duration: number }

/** Exact crossing with normalized positions on both segments. */
export function crossing(a: Point, b: Point, c: Point, d: Point) {
  const rx = b.x - a.x, ry = b.y - a.y
  const sx = d.x - c.x, sy = d.y - c.y
  const cross = rx * sy - ry * sx
  if (Math.abs(cross) < 1e-8) return null
  const first = ((c.x - a.x) * sy - (c.y - a.y) * sx) / cross
  const second = ((c.x - a.x) * ry - (c.y - a.y) * rx) / cross
  if (first < 0 || first > 1 || second < 0 || second > 1) return null
  return { first, second, x: a.x + first * rx, y: a.y + first * ry }
}

const pulseSelector = '.section-story__pulse, .section-story__contact-spectrum'
const colors = ['cyan', 'green', 'yellow', 'red']
const smooth = (n: number) => { const t = Math.max(0, Math.min(1, n)); return t * t * (3 - 2 * t) }
export interface PulseTuning { duration: number; gap: number; length: number; easing: number; noise: number; smoothing: number; afterimages: number }
export const defaultPulseTuning: PulseTuning = { duration: 1700, gap: 800, length: .2, easing: 3, noise: 0, smoothing: .25, afterimages: .7 }

export function useStoryInteractions(ref: RefObject<SVGSVGElement | null>, kind: string, tuning: PulseTuning = defaultPulseTuning) {
  useEffect(() => {
    const svg = ref.current
    if (!svg || typeof SVGPathElement === 'undefined' || !SVGPathElement.prototype.getTotalLength) return
    let visible = typeof IntersectionObserver === 'undefined'
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const easeOut = (t: number) => 1 - (1 - t) ** tuning.easing
    const { noise, smoothing, afterimages } = tuning
    const sources = [...svg.querySelectorAll<SVGPathElement>(pulseSelector)]
    sources.forEach(path => { path.style.opacity = '0' })
    const lines: Line[] = [...svg.querySelectorAll<SVGPathElement>('path')]
      .filter(path => !path.matches(pulseSelector) && !path.closest('defs'))
      .map(path => {
        const length = path.getTotalLength()
        const count = Math.max(8, Math.min(160, Math.ceil(length / 10)))
        return { path, length, cooldown: 0, points: Array.from({ length: count + 1 }, (_, i) => path.getPointAtLength(length * i / count)) }
      }).filter(line => line.length > 0)
    let transfers: Transfer[] = []
    let frame = 0, lastTime = 0, time = 0, lastCollision = -100, color = 0

    let nextBurst = 0
    let synchronized = false, white = false, burstDuration = 500
    const seeded = new Set<Line>()
    const pulseLimit = () => synchronized ? lines.length * 2 : 16

    function clearTransfers() {
      transfers.forEach(pulse => { pulse.path.remove(); pulse.echoes.forEach(path => path.remove()) })
      transfers = []
    }

    function emit(line: Line, position: number, parent: Trail) {
      for (const end of [0, 1]) {
        if (Math.abs(end - position) < .001 || transfers.length >= pulseLimit()) continue
        const path = line.path.cloneNode(false) as SVGPathElement
        path.removeAttribute('id')
        path.removeAttribute('style')
        path.removeAttribute('opacity')
        path.removeAttribute('transform')
        path.setAttribute('class', 'section-story__transfer')
        path.setAttribute('pathLength', '1')
        path.dataset.generation = String(parent.depth + 1)
        path.dataset.origin = String(position)
        path.dataset.direction = String(end > position ? 1 : -1)
        path.setAttribute('stroke', white ? 'white' : `var(--color-icon-${colors[color++ % colors.length]})`)
        path.style.opacity = '0'
        // Render above the artwork so quiet/reflection groups do not hide a real contact.
        svg!.appendChild(path)
        const echoes = afterimages > 0 ? Array.from({ length: 3 }, (_, index) => {
          const echo = path.cloneNode(false) as SVGPathElement
          echo.setAttribute('class', 'section-story__transfer section-story__echo')
          echo.removeAttribute('data-generation')
          echo.setAttribute('stroke', white ? 'white' : `var(--color-icon-${colors[(index + color) % colors.length]})`)
          svg!.insertBefore(echo, path)
          return echo
        }) : []
        transfers.push({
          path, echoes, phase: synchronized ? 0 : Math.random() * Math.PI * 2,
          line, start: position, end, position, direction: end > position ? 1 : -1, width: 0, born: time,
          duration: synchronized ? burstDuration : burstDuration * (.5 + Math.abs(end - position) * .5),
          depth: parent.depth + 1, visited: new Set([...parent.visited, line]), spawned: false,
        })
      }
      line.cooldown = time + 2000
      parent.visited.add(line)
      parent.spawned = true
    }

    function geometry() {
      return lines.map(line => {
        const matrix = line.path.getScreenCTM()
        return { line, matrix, points: matrix ? line.points.map(p => ({ x: matrix.a * p.x + matrix.c * p.y + matrix.e, y: matrix.b * p.x + matrix.d * p.y + matrix.f })) : [] }
      })
    }

    function startBurst(paths: ReturnType<typeof geometry>) {
      const bounds = svg!.parentElement!.getBoundingClientRect()
      const offset = Math.floor(Math.random() * paths.length)
      for (let a = 0; a < paths.length; a++) {
        const first = paths[(a + offset) % paths.length]
        for (let b = a + 1; b < paths.length; b++) {
          const second = paths[(b + offset) % paths.length]
          if (seeded.has(first.line) && seeded.has(second.line)) continue
          for (let i = 1; i < first.points.length; i++) {
            const p = first.line.points[i - 1], q = first.line.points[i]
            if (Math.hypot(q.x - p.x, q.y - p.y) > first.line.length / (first.points.length - 1) * 1.1) continue
            for (let j = 1; j < second.points.length; j++) {
              const r = second.line.points[j - 1], t = second.line.points[j]
              if (Math.hypot(t.x - r.x, t.y - r.y) > second.line.length / (second.points.length - 1) * 1.1) continue
              const hit = crossing(first.points[i - 1], first.points[i], second.points[j - 1], second.points[j])
              if (!hit || hit.x < Math.max(0, bounds.left) || hit.x > Math.min(innerWidth, bounds.right)
                || hit.y < Math.max(0, bounds.top) || hit.y > Math.min(innerHeight, bounds.bottom)) continue
              const parent: Trail = { position: 0, direction: 1, width: 0, visited: new Set([first.line, second.line]), depth: -1, spawned: false }
              if (!seeded.has(first.line)) emit(first.line, (i - 1 + hit.first) / (first.points.length - 1), parent)
              if (!seeded.has(second.line)) emit(second.line, (j - 1 + hit.second) / (second.points.length - 1), parent)
              seeded.add(first.line)
              seeded.add(second.line)
              return true
            }
          }
        }
      }
      return false
    }

    function tick(now: number) {
      time += lastTime ? Math.min(now - lastTime, 100) : 0
      lastTime = now
      if (!transfers.length && time >= nextBurst) {
        synchronized = Math.random() < .25
        white = synchronized && Math.random() < .4
        burstDuration = tuning.duration * (.85 + Math.random() * .3)
        seeded.clear()
        const paths = geometry()
        // Usually one local spark; occasionally light the whole connected drawing.
        const count = synchronized ? lines.length : 1
        for (let i = 0; i < count && startBurst(paths); i++) { /* seed connected lines */ }
        nextBurst = time + burstDuration + tuning.gap * (.65 + Math.random() * .7)
      }
      transfers = transfers.filter(pulse => {
        const age = (time - pulse.born) / pulse.duration
        if (age >= 1 + afterimages * .45) {
          pulse.path.remove()
          pulse.echoes.forEach(path => path.remove())
          return false
        }
        const progress = Math.min(1, age)
        const travel = (t: number) => easeOut(t + .03 * noise * Math.sin(t * Math.PI * 2 + pulse.phase) * Math.sin(t * Math.PI) ** 2)
        pulse.position = pulse.start + (pulse.end - pulse.start) * travel(progress)
        const width = Math.min(tuning.length, Math.abs(pulse.position - pulse.start))
        pulse.width = width
        const tail = pulse.end > pulse.start ? pulse.position - width : pulse.position
        const rootMatrix = svg!.getScreenCTM()
        const lineMatrix = pulse.line.path.getScreenCTM()
        let transform = ''
        if (rootMatrix && lineMatrix) {
          const m = rootMatrix.inverse().multiply(lineMatrix)
          transform = `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`
          pulse.path.setAttribute('transform', transform)
        }
        pulse.path.style.strokeDasharray = `${Math.max(.0001, width)} 2`
        pulse.path.style.strokeDashoffset = String(-tail)
        const envelope = (t: number) => smooth(t / (.04 + smoothing * .2)) * (1 - smooth((t - ( .88 - smoothing * .28)) / (.12 + smoothing * .28)))
        const brightness = 1 - noise * .25 * (.5 + .5 * Math.sin(time * .003 + pulse.phase))
        pulse.path.style.opacity = String(envelope(progress) * brightness)
        pulse.echoes.forEach((echo, index) => {
          const depth = (index + 1) * afterimages
          const t = Math.max(0, Math.min(1, age - depth * .15))
          const position = pulse.start + (pulse.end - pulse.start) * travel(t)
          const length = Math.min(tuning.length, Math.abs(position - pulse.start))
          const box = svg!.viewBox.baseVal
          const cx = box.x + box.width / 2, cy = box.y + box.height / 2
          echo.setAttribute('transform', `translate(${cx} ${cy}) rotate(${depth * 1.4 * smooth(t)}) scale(${1 - depth * .025 * smooth(t)}) translate(${-cx} ${-cy}) ${transform}`)
          echo.style.strokeDasharray = `${Math.max(.0001, length)} 2`
          echo.style.strokeDashoffset = String(-(pulse.end > pulse.start ? position - length : position))
          echo.style.opacity = String(envelope(t) * brightness * afterimages * .38 / (index + 1))
        })
        return true
      })

      // Sample contacts frequently enough to catch the fast launch of each pulse.
      if (time - lastCollision >= 16) {
        lastCollision = time
        // Existing reactions get the first chance to continue before new sources start chains.
        const active: { path: SVGPathElement; trail: Trail }[] = transfers.filter(pulse => time - pulse.born < pulse.duration).map(pulse => ({ path: pulse.path, trail: pulse }))
        const targets = active.length ? geometry() : []

        for (const { path, trail } of active) {
          const matrix = path.getScreenCTM()
          if (!matrix) continue
          const local = path.getPointAtLength(path.getTotalLength() * trail.position)
          const head = { x: matrix.a * local.x + matrix.c * local.y + matrix.e, y: matrix.b * local.x + matrix.d * local.y + matrix.f }
          const previous = trail.previous || head
          trail.previous = head
          if (trail.spawned || trail.depth >= 2 || transfers.length >= pulseLimit()) continue
          const tailPosition = Math.max(0, Math.min(1, trail.position - trail.direction * trail.width))
          const litPoints = Array.from({ length: 5 }, (_, i) => {
            const p = path.getPointAtLength(path.getTotalLength() * (tailPosition + (trail.position - tailPosition) * i / 4))
            return { x: matrix.a * p.x + matrix.c * p.y + matrix.e, y: matrix.b * p.x + matrix.d * p.y + matrix.f }
          })
          for (const target of targets) {
            const { line, points, matrix: targetMatrix } = target
            if (!targetMatrix || trail.visited.has(line) || line.cooldown > time) continue
            // The faint base beneath an animated overlay is the same line, not a contact.
            if (line.path.getAttribute('d') === path.getAttribute('d') &&
              ['a', 'b', 'c', 'd', 'e', 'f'].every(key => Math.abs(matrix[key as keyof DOMMatrix] as number - (targetMatrix[key as keyof DOMMatrix] as number)) < .001)) continue
            let contact: number | null = null
            for (let i = 1; i < points.length; i++) {
              // A new SVG moveto is a gap, not a segment joining the subpaths.
              const p = line.points[i - 1], q = line.points[i]
              if (Math.hypot(q.x - p.x, q.y - p.y) > line.length / (points.length - 1) * 1.1) continue
              let hit = segmentContact(previous, head, points[i - 1], points[i])
              for (let j = 1; hit === null && j < litPoints.length; j++) hit = segmentContact(litPoints[j - 1], litPoints[j], points[i - 1], points[i])
              if (hit !== null) { contact = (i - 1 + hit) / (points.length - 1); break }
            }
            if (contact !== null) { emit(line, contact, trail); break }
          }
        }
      }
      frame = requestAnimationFrame(tick)
    }

    function sync() {
      cancelAnimationFrame(frame)
      lastTime = 0
      const paused = media.matches || document.hidden || !visible
      svg!.toggleAttribute('data-story-paused', paused)
      if (media.matches) {
        clearTransfers()
        sources.forEach(path => { path.style.opacity = '0' })
      }
      if (!paused) frame = requestAnimationFrame(tick)
    }
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    // Observe the clipped scene, not overflowing SVG paths or the whole page.
    observer?.observe(svg.parentElement ?? svg)
    media.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      media.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
      clearTransfers()
      sources.forEach(path => { path.style.opacity = ''; path.style.strokeDashoffset = '' })
      svg.removeAttribute('data-story-paused')
    }
  }, [ref, kind, tuning])
}
