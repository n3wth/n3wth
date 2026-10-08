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
type Transfer = Trail & { path: SVGPathElement; line: Line; start: number; end: number; born: number; duration: number }

const pulseSelector = '.section-story__pulse, .section-story__contact-spectrum'
const colors = ['cyan', 'green', 'yellow', 'red']
const smooth = (n: number) => { const t = Math.max(0, Math.min(1, n)); return t * t * (3 - 2 * t) }

export function useStoryInteractions(ref: RefObject<SVGSVGElement | null>, kind: string) {
  useEffect(() => {
    const svg = ref.current
    if (!svg || typeof SVGPathElement === 'undefined' || !SVGPathElement.prototype.getTotalLength) return
    let visible = typeof IntersectionObserver === 'undefined'
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const sources = [...svg.querySelectorAll<SVGPathElement>(pulseSelector)]
    const sourceTiming = sources.map((path, index) => {
      const duration = 3500 + Math.random() * 3500
      return {
        path, duration, born: null as number | null, direction: 1,
        next: index === 0 ? 0 : 2000 + Math.random() * 22000,
      }
    })
    const lines: Line[] = [...svg.querySelectorAll<SVGPathElement>('path')]
      .filter(path => !path.matches(pulseSelector) && !path.closest('defs'))
      .map(path => {
        const length = path.getTotalLength()
        const count = Math.max(8, Math.min(160, Math.ceil(length / 10)))
        return { path, length, cooldown: 0, points: Array.from({ length: count + 1 }, (_, i) => path.getPointAtLength(length * i / count)) }
      }).filter(line => line.length > 0)
    const trails = new Map<SVGPathElement, Trail>()
    let transfers: Transfer[] = []
    let frame = 0, lastTime = 0, time = 0, lastCollision = -100, color = 0

    function clearTransfers() {
      transfers.forEach(pulse => pulse.path.remove())
      transfers = []
      trails.clear()
    }

    function emit(line: Line, position: number, parent: Trail) {
      const path = line.path.cloneNode(false) as SVGPathElement
      path.removeAttribute('id')
      path.removeAttribute('style')
      path.removeAttribute('opacity')
      path.removeAttribute('transform')
      path.setAttribute('class', 'section-story__transfer')
      path.setAttribute('pathLength', '1')
      path.dataset.generation = String(parent.depth + 1)
      path.setAttribute('stroke', `var(--color-icon-${colors[color++ % colors.length]})`)
      path.style.opacity = '0'
      // Render above the artwork so quiet/reflection groups do not hide a real contact.
      svg!.appendChild(path)
      const end = position < .5 ? 1 : 0
      transfers.push({
        path, line, start: position, end, position, direction: end > position ? 1 : -1, width: 0, born: time,
        duration: 2500 + Math.abs(end - position) * 2500,
        depth: parent.depth + 1, visited: new Set([...parent.visited, line]), spawned: false,
      })
      line.cooldown = time + 2000
      parent.visited.add(line)
      parent.spawned = true
    }

    function tick(now: number) {
      time += lastTime ? Math.min(now - lastTime, 100) : 0
      lastTime = now
      let activeCount = sourceTiming.filter(source => source.born !== null && time - source.born < source.duration).length
      for (const pulse of sourceTiming) {
        if (time >= pulse.next && activeCount < 2) {
          activeCount++
          pulse.born = time
          pulse.direction = Math.random() < .5 ? 1 : -1
          trails.delete(pulse.path)
          pulse.duration = 3500 + Math.random() * 3500
          pulse.next = time + pulse.duration + 18000 + Math.random() * 32000
          pulse.path.style.setProperty('--pulse-length', String(.05 + Math.random() * .08))
        }
        const progress = pulse.born === null ? 1 : Math.min(1, (time - pulse.born) / pulse.duration)
        const width = parseFloat(pulse.path.style.getPropertyValue('--pulse-length'))
        pulse.path.style.strokeDashoffset = String(pulse.direction === 1
          ? width - progress * (1 + width) : -1 + progress * (1 + width))
        pulse.path.style.opacity = String(smooth(progress / .12) * (1 - smooth((progress - .8) / .2)))
      }
      transfers = transfers.filter(pulse => {
        const progress = (time - pulse.born) / pulse.duration
        if (progress >= 1) { pulse.path.remove(); return false }
        pulse.position = pulse.start + (pulse.end - pulse.start) * progress
        const width = Math.min(.075, Math.abs(pulse.position - pulse.start))
        pulse.width = width
        const tail = pulse.end > pulse.start ? pulse.position - width : pulse.position
        const rootMatrix = svg!.getScreenCTM()
        const lineMatrix = pulse.line.path.getScreenCTM()
        if (rootMatrix && lineMatrix) {
          const m = rootMatrix.inverse().multiply(lineMatrix)
          pulse.path.setAttribute('transform', `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`)
        }
        pulse.path.style.strokeDasharray = `${Math.max(.0001, width)} 2`
        pulse.path.style.strokeDashoffset = String(-tail)
        pulse.path.style.opacity = String(smooth(progress / .05) * (1 - smooth((progress - .8) / .2)))
        return true
      })

      // Geometry checks run at 12.5Hz; pulse rendering remains at display refresh rate.
      if (time - lastCollision >= 80) {
        lastCollision = time
        // Existing reactions get the first chance to continue before new sources start chains.
        const active: { path: SVGPathElement; trail: Trail }[] = transfers.map(pulse => ({ path: pulse.path, trail: pulse }))
        for (const { path, direction } of sourceTiming) {
          const style = getComputedStyle(path)
          const head = -parseFloat(style.strokeDashoffset) + (direction === 1 ? parseFloat(style.getPropertyValue('--pulse-length')) : 0)
          if (parseFloat(style.opacity) < .04 || !Number.isFinite(head) || head < 0 || head > 1) {
            trails.delete(path)
            continue
          }
          let trail = trails.get(path)
          if (!trail) {
            trail = { position: head, direction, width: 0, visited: new Set(), depth: 0, spawned: false }
            trails.set(path, trail)
          }
          trail.position = head
          trail.width = parseFloat(style.getPropertyValue('--pulse-length'))
          active.push({ path, trail })
        }

        const geometry = active.length ? lines.map(line => {
          const matrix = line.path.getScreenCTM()
          return { line, matrix, points: matrix ? line.points.map(p => ({ x: matrix.a * p.x + matrix.c * p.y + matrix.e, y: matrix.b * p.x + matrix.d * p.y + matrix.f })) : [] }
        }) : []

        for (const { path, trail } of active) {
          const matrix = path.getScreenCTM()
          if (!matrix) continue
          const local = path.getPointAtLength(path.getTotalLength() * trail.position)
          const head = { x: matrix.a * local.x + matrix.c * local.y + matrix.e, y: matrix.b * local.x + matrix.d * local.y + matrix.f }
          const previous = trail.previous || head
          trail.previous = head
          if (trail.spawned || trail.depth >= 2 || transfers.length >= 2) continue
          const tailPosition = Math.max(0, Math.min(1, trail.position - trail.direction * trail.width))
          const litPoints = Array.from({ length: 5 }, (_, i) => {
            const p = path.getPointAtLength(path.getTotalLength() * (tailPosition + (trail.position - tailPosition) * i / 4))
            return { x: matrix.a * p.x + matrix.c * p.y + matrix.e, y: matrix.b * p.x + matrix.d * p.y + matrix.f }
          })
          for (const target of geometry) {
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
  }, [ref, kind])
}
