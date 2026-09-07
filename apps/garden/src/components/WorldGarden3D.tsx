'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { type WorldNode, type WorldEdge, type SimNode, layoutWorld } from '@/lib/worldLayout'

interface WorldGarden3DProps {
  nodes: WorldNode[]
  edges: WorldEdge[]
  /** Fly the camera in from high above on first render. */
  intro?: boolean
  /** Clicking a light selects its note; empty space and Escape pass null. */
  onSelect: (id: string | null) => void
}

// n3wth wireframe ramp: maturity = brightness (mirrors WorldGarden.tsx)
const stageColors: Record<string, string> = {
  seedling: '#62666d',
  budding: '#9aa0a8',
  evergreen: '#f2f3f5',
}

const stageLabels: Record<string, string> = {
  seedling: 'Seedling',
  budding: 'Budding',
  evergreen: 'Evergreen',
}

const BG = '#08090b'
const SCALE = 1 / 40 // world units -> three.js scene units

/* The one resting camera. Every path — the intro flight, the pointer
   parallax, and the reduced-motion still — has to land on exactly these
   numbers, or the hand-off between them reads as a jump-cut. */
const REST_RADIUS = 19
const REST_HEIGHT = 5.2
const LOOK_AT_Y = 1.9

/* ── The garden has a time of day ──────────────────────────────────────
   The one place this site spends colour. Everything else — every page,
   every control, the plants themselves — stays on the grayscale ramp, so
   maturity is still the only thing brightness ever means. What changes
   here is the light: the visitor's own clock picks the hour, and the
   ground, fog and sun shift with it. Saturation stays low on purpose;
   the aim is that the garden is never quite the same colour twice, not
   that the homepage becomes colourful.

   Values are deliberately close to the near-black canvas — this is a
   tint on #08090b, not a skybox. */
interface DayLight {
  /** Horizon and fog: what the distance dissolves into. */
  air: string
  /** The soil underfoot. */
  ground: string
  /** Sun colour and strength. */
  sun: string
  sunIntensity: number
  ambient: number
  label: string
}

const HOURS: { until: number; light: DayLight }[] = [
  // deep night — cold, almost monochrome, the plants do the lighting
  { until: 5, light: { air: '#0a0d18', ground: '#0b0d13', sun: '#8fa6c8', sunIntensity: 0.16, ambient: 0.45, label: 'night' } },
  // first light — warm low sun raking across the ground
  { until: 8, light: { air: '#20160e', ground: '#14110f', sun: '#ffc98e', sunIntensity: 0.34, ambient: 0.5, label: 'dawn' } },
  // morning — clearing, still faintly warm
  { until: 11, light: { air: '#12110f', ground: '#111213', sun: '#ffe6c9', sunIntensity: 0.3, ambient: 0.56, label: 'morning' } },
  // midday — neutral, the brightest and flattest the garden gets
  { until: 16, light: { air: '#0d0e10', ground: '#111214', sun: '#ffffff', sunIntensity: 0.28, ambient: 0.6, label: 'midday' } },
  // late afternoon — the light goes long and amber
  { until: 19, light: { air: '#23160d', ground: '#15110e', sun: '#ffb877', sunIntensity: 0.36, ambient: 0.52, label: 'afternoon' } },
  // dusk — rose in the air, ground cooling first
  { until: 21, light: { air: '#20101a', ground: '#100e13', sun: '#e3859b', sunIntensity: 0.26, ambient: 0.46, label: 'dusk' } },
  // night again
  { until: 24, light: { air: '#0a0d18', ground: '#0b0d13', sun: '#8fa6c8', sunIntensity: 0.16, ambient: 0.45, label: 'night' } },
]

function lightForHour(hour: number): DayLight {
  return (HOURS.find((h) => hour < h.until) ?? HOURS[HOURS.length - 1]).light
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3)
}

function Scene({
  nodes,
  edges,
  intro,
  reducedMotion,
  onSelect,
}: {
  nodes: WorldNode[]
  edges: WorldEdge[]
  intro: boolean
  reducedMotion: boolean
  onSelect: (id: string | null) => void
}) {
  const gl = useThree((s) => s.gl)

  /* Midday until the client tells us otherwise — the hour has to come from
     the visitor's own clock, and guessing it during render would hydrate
     one garden over another. */
  const [day, setDay] = useState<DayLight>(() => lightForHour(12))
  useEffect(() => {
    setDay(lightForHour(new Date().getHours()))
  }, [])

  const world = useMemo(() => layoutWorld(nodes, edges), [nodes, edges])

  // Deep time growth (g), computed once at mount — same logic WorldGarden.tsx
  // runs per frame, frozen at "today" since this scene doesn't replay time.
  const gById = useMemo(() => {
    const NOW = Date.now()
    const GENESIS = Math.min(...world.sim.map((n) => n.birth))
    const SPAN = Math.max(1, NOW - GENESIS)
    const GROW_MS = 21 * 24 * 3600 * 1000
    const map = new Map<string, number>()
    for (const n of world.sim) {
      const age = NOW - n.birth
      const g = age <= 0 ? 0 : Math.min(1, 0.12 + (age / GROW_MS) * 0.88)
      map.set(n.id, g)
    }
    return map
  }, [world])

  // ── plants: one LineSegments, per-vertex stage color * growth ────────
  const plantsGeometry = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const c = new THREE.Color()
    for (let i = 0; i < world.sim.length; i++) {
      const n = world.sim[i]
      const g = gById.get(n.id) ?? 0
      if (g <= 0) continue
      c.set(stageColors[n.stage] ?? '#9aa0a8').multiplyScalar(g)
      for (const s of world.plants[i]) {
        const ax = (n.x + (s.ax - n.x) * g) * SCALE
        const ay = s.ay * g * SCALE
        const az = (n.z + (s.az - n.z) * g) * SCALE
        const bx = (n.x + (s.bx - n.x) * g) * SCALE
        const by = s.by * g * SCALE
        const bz = (n.z + (s.bz - n.z) * g) * SCALE
        positions.push(ax, ay, az, bx, by, bz)
        colors.push(c.r, c.g, c.b, c.r, c.g, c.b)
      }
    }
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return geom
  }, [world, gById])

  /* The forest floor. layoutWorld has always produced this undergrowth and
     the 3D world simply never drew it, so the trees stood on bare ground.
     Dim and fog-bound on purpose: it should read as ground cover thinning
     into the mist, never as another rank of notes. */
  const undergrowthGeometry = useMemo(() => {
    const positions: number[] = []
    for (const s of world.undergrowth) {
      positions.push(
        s.ax * SCALE, s.ay * SCALE, s.az * SCALE,
        s.bx * SCALE, s.by * SCALE, s.bz * SCALE
      )
    }
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geom
  }, [world])

  // ── the network: every wikilink as a root-thread along the ground.
  //    This is what makes it a garden of connected ideas rather than a
  //    field of isolated plants. Hovering a plant lights its neighborhood.
  const EDGE_BASE = useMemo(() => new THREE.Color('#23262c'), [])
  const network = useMemo(() => {
    const indexById = new Map<string, number>()
    world.sim.forEach((n, i) => indexById.set(n.id, i))
    const positions: number[] = []
    const colors: number[] = []
    // per node: the vertex indices of every edge it touches, and its neighbors
    const edgeVertsByNode = new Map<number, number[]>()
    const neighborsByNode = new Map<number, number[]>()
    const push = (m: Map<number, number[]>, k: number, v: number) => {
      const arr = m.get(k)
      if (arr) arr.push(v)
      else m.set(k, [v])
    }
    let v = 0
    for (const e of edges) {
      const a = indexById.get(e.source)
      const b = indexById.get(e.target)
      if (a === undefined || b === undefined) continue
      const na = world.sim[a]
      const nb = world.sim[b]
      positions.push(na.x * SCALE, 0.015, na.z * SCALE, nb.x * SCALE, 0.015, nb.z * SCALE)
      colors.push(EDGE_BASE.r, EDGE_BASE.g, EDGE_BASE.b, EDGE_BASE.r, EDGE_BASE.g, EDGE_BASE.b)
      push(edgeVertsByNode, a, v)
      push(edgeVertsByNode, a, v + 1)
      push(edgeVertsByNode, b, v)
      push(edgeVertsByNode, b, v + 1)
      push(neighborsByNode, a, b)
      push(neighborsByNode, b, a)
      v += 2
    }
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return { geom, edgeVertsByNode, neighborsByNode }
  }, [world, edges, EDGE_BASE])

  // ── tips: instanced spheres at each plant's top point ─────────────────
  const tipGeometry = useMemo(() => new THREE.SphereGeometry(0.05, 8, 8), [])
  const tipMaterial = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), [])
  const tipsRef = useRef<THREE.InstancedMesh>(null)
  const tipBaseColors = useRef<THREE.Color[]>([])

  // ── hit spheres: invisible, raycast targets for hover/click ───────────
  // Forgiving target: 0.35 was a hard thing to keep a cursor on, and an
  // even harder thing to tap.
  const hitGeometry = useMemo(() => new THREE.SphereGeometry(0.5, 8, 8), [])
  const hitMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, depthTest: false }),
    []
  )
  const hitRef = useRef<THREE.InstancedMesh>(null)
  const hoverIndexRef = useRef<number | null>(null)

  // hover label: one Html element riding the hovered tip, moved via refs
  // so hover never triggers a React re-render
  const labelGroupRef = useRef<THREE.Group>(null)
  const labelWrapRef = useRef<HTMLDivElement>(null)
  const labelTitleRef = useRef<HTMLDivElement>(null)
  const labelStageRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const tips = tipsRef.current
    const hits = hitRef.current
    if (!tips || !hits) return
    const dummy = new THREE.Object3D()
    const baseColors: THREE.Color[] = []
    for (let i = 0; i < world.sim.length; i++) {
      const n = world.sim[i]
      const g = gById.get(n.id) ?? 0
      const x = n.x * SCALE
      const y = n.y * g * SCALE
      const z = n.z * SCALE

      dummy.position.set(x, y, z)
      // meaning: a tip's size is its connectedness — hub notes read bigger
      const linkScale = 0.75 + Math.min(n.linkCount, 10) * 0.09
      dummy.scale.setScalar(g > 0.6 ? linkScale : 0.0001)
      dummy.updateMatrix()
      tips.setMatrixAt(i, dummy.matrix)
      const col = new THREE.Color(stageColors[n.stage] ?? '#9aa0a8')
      baseColors.push(col)
      tips.setColorAt(i, col)

      dummy.position.set(x, y, z)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      hits.setMatrixAt(i, dummy.matrix)
    }
    tipBaseColors.current = baseColors
    tips.instanceMatrix.needsUpdate = true
    if (tips.instanceColor) tips.instanceColor.needsUpdate = true
    hits.instanceMatrix.needsUpdate = true
  }, [world, gById])

  const setHover = useCallback(
    (idx: number | null) => {
      if (idx === hoverIndexRef.current) return
      const tips = tipsRef.current
      const colorAttr = network.geom.getAttribute('color') as THREE.BufferAttribute
      const restore = (i: number) => {
        if (!tips) return
        const base = tipBaseColors.current[i]
        if (base) tips.setColorAt(i, base)
      }
      const paintEdges = (i: number, c: THREE.Color) => {
        for (const vi of network.edgeVertsByNode.get(i) ?? []) {
          colorAttr.setXYZ(vi, c.r, c.g, c.b)
        }
      }
      // restore the previous neighborhood
      if (hoverIndexRef.current !== null) {
        const prev = hoverIndexRef.current
        restore(prev)
        for (const nb of network.neighborsByNode.get(prev) ?? []) restore(nb)
        paintEdges(prev, EDGE_BASE)
      }
      // light the new one: the note, its links, and its linked notes
      if (idx !== null && tips) {
        const base = tipBaseColors.current[idx]
        if (base) tips.setColorAt(idx, base.clone().multiplyScalar(1.6))
        for (const nb of network.neighborsByNode.get(idx) ?? []) {
          const nbase = tipBaseColors.current[nb]
          if (nbase) tips.setColorAt(nb, nbase.clone().multiplyScalar(1.35))
        }
        paintEdges(idx, new THREE.Color('#6b7078'))
      }
      if (tips?.instanceColor) tips.instanceColor.needsUpdate = true
      colorAttr.needsUpdate = true
      hoverIndexRef.current = idx
      gl.domElement.style.cursor = idx !== null ? 'pointer' : 'default'
      // move the label to the hovered tip and fill it in, all through refs
      const wrap = labelWrapRef.current
      if (idx !== null) {
        const n = world.sim[idx]
        const g = gById.get(n.id) ?? 0
        labelGroupRef.current?.position.set(n.x * SCALE, n.y * g * SCALE + 0.15, n.z * SCALE)
        if (labelTitleRef.current) labelTitleRef.current.textContent = n.title
        if (labelStageRef.current) labelStageRef.current.textContent = stageLabels[n.stage] || n.stage
        if (wrap) wrap.style.opacity = '1'
      } else if (wrap) {
        wrap.style.opacity = '0'
      }
    },
    [gl, world, network, EDGE_BASE, gById]
  )

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setHover(e.instanceId ?? null)
    },
    [setHover]
  )
  const handlePointerOut = useCallback(() => setHover(null), [setHover])
  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (e.instanceId === undefined) return
      const node = world.sim[e.instanceId]
      if (!node) return
      onSelect(node.id)
    },
    [onSelect, world]
  )

  // ── grove labels: suppressed once the world gets too busy ─────────────
  const showGroveLabels = world.groves.length <= 12

  // ── sprout heartbeat: one note re-grows from soil to tip every 16s ────
  const recentNodes = useMemo(
    () => [...world.sim].sort((a, b) => (b.created ?? b.birth) - (a.created ?? a.birth)),
    [world]
  )
  const sproutGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
    return geom
  }, [])
  // `<line>` is ambiguous with the SVG intrinsic in this project's JSX types,
  // so the sprout line is built as a plain three.js object and mounted via <primitive>.
  const sproutLine = useMemo(
    () =>
      new THREE.Line(
        sproutGeometry,
        new THREE.LineBasicMaterial({ color: '#f2f3f5', transparent: true, opacity: 0, toneMapped: false })
      ),
    [sproutGeometry]
  )
  const sproutState = useRef<{ node: SimNode | null; start: number; k: number; lastTrigger: number }>({
    node: null,
    start: -Infinity,
    k: 0,
    lastTrigger: 0,
  })

  // ── camera + wind + sprout, all per-frame, everything else static ─────
  const swayGroupRef = useRef<THREE.Group>(null)
  const swayAmpRef = useRef(1)
  const yawRef = useRef(0)
  const heightRef = useRef(REST_HEIGHT)
  const introRef = useRef({ active: intro, t: 0 })

  useFrame((state, delta) => {
    const camera = state.camera

    if (reducedMotion) {
      camera.position.set(0, REST_HEIGHT, REST_RADIUS)
      camera.lookAt(0, LOOK_AT_Y, 0)
    } else if (introRef.current.active) {
      introRef.current.t = Math.min(1, introRef.current.t + delta / 2.5)
      const e = easeOutCubic(introRef.current.t)
      camera.position.set(0, THREE.MathUtils.lerp(26, REST_HEIGHT, e), THREE.MathUtils.lerp(44, REST_RADIUS, e))
      camera.lookAt(0, LOOK_AT_Y, 0)
      if (introRef.current.t >= 1) {
        // hand the resting loop the exact state the flight ended on
        heightRef.current = REST_HEIGHT
        yawRef.current = 0
        introRef.current.active = false
      }
    } else {
      const targetYaw = state.pointer.x * 0.35
      const targetHeight = REST_HEIGHT - state.pointer.y * 1.8
      const k = 1 - Math.exp(-delta * 4)
      yawRef.current += (targetYaw - yawRef.current) * k
      heightRef.current += (targetHeight - heightRef.current) * k
      camera.position.x = Math.sin(yawRef.current) * REST_RADIUS
      camera.position.z = Math.cos(yawRef.current) * REST_RADIUS
      camera.position.y = heightRef.current
      camera.lookAt(0, LOOK_AT_Y, 0)
    }

    if (swayGroupRef.current) {
      /* The wind stills while you are looking at something. This is not
         only manners: the hit spheres sway with the plants, so a cursor
         parked on a light had the target rotate out from under it and
         the label blinked off while the pointer had not moved. */
      const target = hoverIndexRef.current !== null ? 0 : 1
      swayAmpRef.current += (target - swayAmpRef.current) * 0.08
      swayGroupRef.current.rotation.z = reducedMotion
        ? 0
        : (Math.sin(state.clock.elapsedTime * 0.5) * 0.012 +
            Math.sin(state.clock.elapsedTime * 1.31 + 2) * 0.009) *
          swayAmpRef.current
    }

    if (!reducedMotion && recentNodes.length > 0) {
      const elapsed = state.clock.elapsedTime
      const s = sproutState.current
      if (elapsed - s.lastTrigger >= 16) {
        s.node = recentNodes[s.k % recentNodes.length]
        s.start = elapsed
        s.k += 1
        s.lastTrigger = elapsed
      }
      if (s.node) {
        const localT = elapsed - s.start
        const g = gById.get(s.node.id) ?? 0
        const topY = s.node.y * g * SCALE
        const x = s.node.x * SCALE
        const z = s.node.z * SCALE
        let opacity = 0
        let growY = 0
        if (localT < 1.2) {
          growY = topY * easeOutCubic(localT / 1.2)
          opacity = 1
        } else if (localT < 2.2) {
          growY = topY
          opacity = 1 - (localT - 1.2) / 1.0
        }
        const pos = sproutGeometry.attributes.position as THREE.BufferAttribute
        pos.setXYZ(0, x, 0, z)
        pos.setXYZ(1, x, growY, z)
        pos.needsUpdate = true
        ;(sproutLine.material as THREE.LineBasicMaterial).opacity = Math.max(0, opacity)
      }
    } else {
      ;(sproutLine.material as THREE.LineBasicMaterial).opacity = 0
    }
  })

  return (
    <>
      <color attach="background" args={[BG]} />
      {/* The hour reaches the scene through the air and the soil, never
          through the plants: their grayscale ramp still has to read as
          maturity and nothing else. */}
      <fog attach="fog" args={[day.air, 9, 34]} />
      <ambientLight intensity={day.ambient} />
      <directionalLight position={[10, 20, 10]} intensity={day.sunIntensity} color={day.sun} />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[90, 64]} />
        <meshStandardMaterial color={day.ground} roughness={1} metalness={0} />
      </mesh>
      {/* the link network: ideas connected at the root */}
      <lineSegments geometry={network.geom}>
        <lineBasicMaterial vertexColors toneMapped={false} fog />
      </lineSegments>

      {/* plants + tips + hit targets sway together in the wind */}
      <group ref={swayGroupRef}>
        {/* forest floor, under everything and dimmer than any note */}
        <lineSegments geometry={undergrowthGeometry}>
          <lineBasicMaterial color="#31353c" toneMapped={false} fog transparent opacity={0.55} />
        </lineSegments>

        <lineSegments geometry={plantsGeometry}>
          <lineBasicMaterial vertexColors toneMapped={false} fog transparent opacity={1} />
        </lineSegments>

        <instancedMesh
          ref={tipsRef}
          args={[tipGeometry, tipMaterial, world.sim.length]}
          frustumCulled={false}
        />

        <instancedMesh
          ref={hitRef}
          args={[hitGeometry, hitMaterial, world.sim.length]}
          frustumCulled={false}
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />

        <primitive object={sproutLine} />

        {/* hover label: rides the hovered tip; content and position set in
            setHover. It lives INSIDE the sway group on purpose — the plants
            and hit targets rotate with the wind, so a label parked at the
            node's static coordinates drifted off the plant it named.
            pointer-events must be killed on the wrapper via style — the prop
            only applies in transform mode, and an invisible div would eat
            tip clicks */}
        <group ref={labelGroupRef}>
          <Html center pointerEvents="none" style={{ pointerEvents: 'none' }}>
            <div
              ref={labelWrapRef}
              style={{
                textAlign: 'center',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                opacity: 0,
                transition: 'opacity 0.25s',
                /* A tooltip, not floating text: the lights it labels are
                   near-white, and unbacked type on them was unreadable. */
                background: 'rgba(8, 9, 11, 0.92)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '8px',
                padding: '6px 10px',
                transform: 'translateY(-14px)',
              }}
            >
              <div ref={labelTitleRef} style={{ fontSize: '13px', color: '#f2f3f5' }} />
              <div ref={labelStageRef} style={{ fontSize: '11px', color: '#9aa0a8', marginTop: '2px' }} />
            </div>
          </Html>
        </group>
      </group>

      {/* grove labels */}
      {showGroveLabels &&
        world.groves.map((g) => (
          <Html
            key={g.tag}
            position={[g.x * SCALE, 0.2, g.z * SCALE]}
            center
            pointerEvents="none"
            style={{
              fontSize: '11px',
              letterSpacing: '0.12em',
              color: '#62666d',
              whiteSpace: 'nowrap',
            }}
          >
            {g.tag}
          </Html>
        ))}
    </>
  )
}

export function WorldGarden3D({ nodes, edges, intro = true, onSelect }: WorldGarden3DProps) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
  }, [])

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      role="img"
      aria-label="3D map of the garden. Each point of light is a note; links between notes are drawn as lines. A list of all notes follows this map."
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 55, position: [0, REST_HEIGHT, REST_RADIUS] }}
        gl={{ antialias: true }}
        onPointerMissed={() => onSelect(null)}
      >
        <Scene nodes={nodes} edges={edges} intro={intro} reducedMotion={reducedMotion} onSelect={onSelect} />
      </Canvas>
    </div>
  )
}
