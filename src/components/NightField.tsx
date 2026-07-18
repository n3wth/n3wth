import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, Stars, useCursor, useTexture } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'

/**
 * The front door as a real night field (three.js): every glowing
 * structure is one of Oliver's works standing in for a page, bloom makes
 * the light actually glow, and each structure's point light pools its
 * color on the ground — the only color on the site.
 *
 * Navigation is passed in as a callback because r3f's Canvas is its own
 * React tree: router context doesn't cross the bridge.
 */

export interface NightFieldProps {
  onEnter: (href: string, external?: boolean) => void
  reducedMotion: boolean
}

interface PortalDef {
  id: string
  label: string
  sub: string
  href: string
  external?: boolean
}

function usePortalHover(): [boolean, { onPointerOver: (e: THREE.Event) => void; onPointerOut: () => void }] {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  return [
    hovered,
    {
      onPointerOver: (e: THREE.Event) => {
        ;(e as unknown as { stopPropagation: () => void }).stopPropagation()
        setHovered(true)
      },
      onPointerOut: () => setHovered(false),
    },
  ]
}

function PortalLabel({ visible, label, sub, y = 0 }: { visible: boolean; label: string; sub: string; y?: number }) {
  if (!visible) return null
  return (
    <Html position={[0, y, 0]} center zIndexRange={[20, 10]} style={{ pointerEvents: 'none' }}>
      <div className="world-label" style={{ position: 'static', transform: 'translateY(-8px)' }}>
        <span className="world-label-title">{label}</span>
        <span className="world-label-sub">{sub}</span>
      </div>
    </Html>
  )
}

/* THEM — wireframe beast in warm white light, right of center */
function Them({ def, onEnter, reducedMotion }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean }) {
  const [hovered, handlers] = usePortalHover()
  const group = useRef<THREE.Group>(null)
  type LineHandle = { material: { color: THREE.Color } }
  const mats = useRef<LineHandle[]>([])

  const segments = useMemo(() => {
    /* A standing quadruped drawn in light: four legs with knees, a
       faceted body, a raised neck and angular head — the vocabulary of
       the real THEM creatures. */
    const v: [number, number, number][] = [
      // leg tips (ground): FL, FR, BL, BR
      [2.3, 0, 1.2], [2.6, 0, -1.0], [-2.5, 0, 1.1], [-2.8, 0, -1.2],
      // knees
      [2.15, 2.1, 1.0], [2.4, 2.1, -0.9], [-2.35, 2.2, 0.9], [-2.6, 2.2, -1.0],
      // shoulders / hips (body corners)
      [1.9, 4.1, 0.85], [2.0, 4.1, -0.8], [-2.0, 4.3, 0.8], [-2.2, 4.3, -0.75],
      // spine ridge (front, back)
      [1.5, 5.1, 0], [-1.6, 5.3, 0],
      // neck base -> head
      [2.0, 4.8, 0], [3.4, 6.6, 0],
      // muzzle, ears
      [4.4, 6.3, 0], [3.5, 7.3, 0.35], [3.3, 7.3, -0.35],
    ]
    const e: [number, number][] = [
      // legs
      [0, 4], [4, 8], [1, 5], [5, 9], [2, 6], [6, 10], [3, 7], [7, 11],
      // body box
      [8, 9], [10, 11], [8, 10], [9, 11],
      // spine ridge facets
      [8, 12], [9, 12], [10, 13], [11, 13], [12, 13],
      // neck + head
      [12, 14], [14, 15], [15, 16], [15, 17], [15, 18], [16, 17], [16, 18],
    ]
    return e.map(([a, b]) => [v[a], v[b]] as [number, number, number][])
  }, [])

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.elapsedTime
    const breathe = 1.6 + Math.sin(t * 1.1) * 0.5 + (hovered ? 1.6 : 0)
    for (const line of mats.current) {
      if (line?.material?.color) line.material.color.setScalar(breathe)
    }
  })

  return (
    <group
      ref={group}
      position={[10, 0, -14]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      {segments.map((seg, i) => (
        <Line
          key={i}
          ref={(el: unknown) => {
            if (el) mats.current[i] = el as LineHandle
          }}
          points={seg}
          color={new THREE.Color('#ffdda8').multiplyScalar(hovered ? 3.4 : 2)}
          lineWidth={1.6}
          toneMapped={false}
        />
      ))}
      {/* invisible hit volume so the whole beast is clickable */}
      <mesh position={[0, 4, 0]} visible={false}>
        <boxGeometry args={[6.5, 9, 3]} />
      </mesh>
      <pointLight position={[0, 3.5, 0]} color="#ffce8a" intensity={hovered ? 40 : 22} distance={26} decay={2} />
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={9.4} />
    </group>
  )
}

/* Work — a scaffold tower of light, mid-build: three lit levels and a
   small crane arm still swinging. Building, as an object. */
function Constellation({ def, onEnter, reducedMotion }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean }) {
  const [hovered, handlers] = usePortalHover()

  const segments = useMemo(() => {
    const segs: [number, number, number][][] = []
    const w = 1.5
    const levels = [0, 2.2, 4.4, 6.6]
    const corners = (y: number): [number, number, number][] => [
      [-w, y, -w], [w, y, -w], [w, y, w], [-w, y, w],
    ]
    // verticals
    for (let c = 0; c < 4; c++) {
      const bottom = corners(0)[c]
      const top = corners(levels[3])[c]
      segs.push([bottom, top])
    }
    // horizontal rings + one diagonal per level face
    for (const y of levels.slice(1)) {
      const ring = corners(y)
      for (let c = 0; c < 4; c++) segs.push([ring[c], ring[(c + 1) % 4]])
    }
    for (let i = 0; i < 3; i++) {
      const y0 = levels[i]
      const y1 = levels[i + 1]
      segs.push([[-w, y0, w], [w, y1, w]])
      segs.push([[w, y0, -w], [-w, y1, -w]])
    }
    // crane arm on top
    segs.push([[0, levels[3], 0], [0, 8.4, 0]])
    segs.push([[0, 8.4, 0], [3.1, 8.0, 0]])
    segs.push([[3.1, 8.0, 0], [3.1, 6.6, 0]])
    return segs
  }, [])

  return (
    <group
      position={[27, 0, -31]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      {segments.map((seg, i) => (
        <Line
          key={i}
          points={seg}
          color={new THREE.Color('#9fc4ff').multiplyScalar(hovered ? 3.6 : 2.1)}
          lineWidth={1.4}
          toneMapped={false}
        />
      ))}
      {/* the load on the crane hook, breathing */}
      <CraneLoad hovered={hovered} reducedMotion={reducedMotion} />
      <mesh position={[0.6, 4.2, 0]} visible={false}>
        <boxGeometry args={[8, 9.5, 4.5]} />
      </mesh>
      <pointLight position={[0, 3.4, 0]} color="#7ea8e8" intensity={hovered ? 28 : 16} distance={22} decay={2} />
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={9.2} />
    </group>
  )
}

function CraneLoad({ hovered, reducedMotion }: { hovered: boolean; reducedMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return
    ref.current.position.y = 5.6 + Math.sin(clock.elapsedTime * 0.7) * 0.5
  })
  return (
    <mesh ref={ref} position={[3.1, 5.6, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshBasicMaterial color={new THREE.Color('#c3dcff').multiplyScalar(hovered ? 3.4 : 2.2)} toneMapped={false} />
    </mesh>
  )
}

/* Thinking — a path of light that forks on the ground */
function Fork({ def, onEnter, reducedMotion }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean }) {
  const [hovered, handlers] = usePortalHover()

  const shapes = useMemo(() => {
    const mk = (pts: [number, number, number][]) =>
      new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))).getPoints(30).map((v) => [v.x, v.y, v.z] as [number, number, number])
    /* A signpost at a fork: the post, two arrow boards pointing apart,
       and the two paths actually diverging on the ground beneath it. */
    const post: [number, number, number][] = [[0, 0, 0], [0, 4.6, 0]]
    const arrowR: [number, number, number][] = [
      [0, 4.1, 0], [2.0, 4.25, 0], [1.6, 4.55, 0], [2.0, 4.25, 0], [1.6, 3.95, 0],
    ]
    const arrowL: [number, number, number][] = [
      [0, 3.3, 0], [-1.9, 3.5, 0], [-1.5, 3.8, 0], [-1.9, 3.5, 0], [-1.5, 3.2, 0],
    ]
    const pathR = mk([[0, 0.06, 0.4], [1.6, 0.06, -1.8], [3.6, 0.06, -3.6]])
    const pathL = mk([[0, 0.06, 0.4], [-1.4, 0.06, -1.9], [-3.2, 0.06, -3.9]])
    return [post, arrowR, arrowL, pathR, pathL]
  }, [])

  const glow = hovered ? 3.6 : 2.1
  void reducedMotion

  return (
    <group
      position={[1, 0, -5]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      {shapes.map((pts, i) => (
        <Line key={i} points={pts} color={new THREE.Color('#8fdfff').multiplyScalar(glow)} lineWidth={2} toneMapped={false} />
      ))}
      <mesh position={[0, 2.4, 0]} visible={false}>
        <boxGeometry args={[5.4, 5.4, 3]} />
      </mesh>
      <pointLight position={[0, 2.4, 0.6]} color="#79c8ea" intensity={hovered ? 18 : 9} distance={14} decay={2} />
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={5.6} />
    </group>
  )
}

/* Contact — a warm beacon */
function Beacon({ def, onEnter, reducedMotion }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean }) {
  const [hovered, handlers] = usePortalHover()
  const light = useRef<THREE.PointLight>(null)
  const core = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.elapsedTime
    const flicker = 1 + Math.sin(t * 7.3) * 0.08 + Math.sin(t * 13.7) * 0.05
    if (light.current) light.current.intensity = (hovered ? 44 : 26) * flicker
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 2.1) * 0.06)
  })

  const logs = useMemo(() => {
    const out: [number, number, number][][] = []
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.4
      out.push([
        [Math.cos(a) * 1.5, 0.12, Math.sin(a) * 1.5],
        [Math.cos(a + Math.PI) * 0.4, 0.95, Math.sin(a + Math.PI) * 0.4],
      ])
    }
    return out
  }, [])

  return (
    <group
      position={[-4.5, 0, -2]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      {/* leaning logs */}
      {logs.map((seg, i) => (
        <Line key={i} points={seg} color="#3a2a1c" lineWidth={3} toneMapped={false} />
      ))}
      {/* flame core */}
      <mesh ref={core} position={[0, 1.0, 0]}>
        <coneGeometry args={[0.42, 1.3, 6]} />
        <meshBasicMaterial color={new THREE.Color('#ffb877').multiplyScalar(hovered ? 5 : 3.6)} toneMapped={false} />
      </mesh>
      <Embers hovered={hovered} reducedMotion={reducedMotion} />
      <mesh position={[0, 1.2, 0]} visible={false}>
        <sphereGeometry args={[2.6, 8, 8]} />
      </mesh>
      <pointLight ref={light} position={[0, 1.6, 0]} color="#ff9d4d" intensity={26} distance={30} decay={2} />
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={3.2} />
    </group>
  )
}

function Embers({ hovered, reducedMotion }: { hovered: boolean; reducedMotion: boolean }) {
  const inst = useRef<THREE.InstancedMesh>(null)
  const N = 7
  useFrame(({ clock }) => {
    const mesh = inst.current
    if (!mesh) return
    const t = reducedMotion ? 0 : clock.elapsedTime
    const dummy = new THREE.Object3D()
    for (let i = 0; i < N; i++) {
      const cycle = (t * 0.55 + i / N) % 1
      dummy.position.set(
        Math.sin(i * 5.1 + cycle * 6) * 0.35,
        1.2 + cycle * 2.6,
        Math.cos(i * 3.7 + cycle * 5) * 0.35
      )
      dummy.scale.setScalar(0.05 * (1 - cycle) + 0.015)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={inst} args={[undefined, undefined, N]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color={new THREE.Color('#ffc490').multiplyScalar(hovered ? 4 : 3)} toneMapped={false} />
    </instancedMesh>
  )
}

/* The garden — glowing stems with light tips, the plant-glyph language
   of garden.n3wth.com grown into the field */
function GardenPatch({ def, onEnter, reducedMotion }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean }) {
  const [hovered, handlers] = usePortalHover()
  const inst = useRef<THREE.InstancedMesh>(null)

  const stems = useMemo(() => {
    const out: { x: number; z: number; h: number; lean: number }[] = []
    for (let i = 0; i < 18; i++) {
      const a = i * 2.399
      const r = 0.6 + (i % 7) * 0.5
      out.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r * 0.8,
        h: 0.7 + (i % 5) * 0.45,
        lean: Math.sin(i * 3.3) * 0.18,
      })
    }
    return out
  }, [])

  useFrame(({ clock }) => {
    const mesh = inst.current
    if (!mesh) return
    const t = reducedMotion ? 0 : clock.elapsedTime
    const dummy = new THREE.Object3D()
    for (let i = 0; i < stems.length; i++) {
      const p = stems[i]
      const sway = reducedMotion ? 0 : Math.sin(t * 1.4 + i * 1.9) * 0.06
      dummy.position.set(p.x + p.lean + sway, p.h, p.z)
      dummy.scale.setScalar((0.06 + (i % 4) * 0.016) * (hovered ? 1.6 : 1))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <group
      position={[-9, 0, -1]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      {/* stems */}
      {stems.map((p, i) => (
        <Line
          key={i}
          points={[
            [p.x, 0, p.z],
            [p.x + p.lean, p.h, p.z],
          ]}
          color={new THREE.Color('#4fae78').multiplyScalar(hovered ? 2.6 : 1.6)}
          lineWidth={1.1}
          toneMapped={false}
        />
      ))}
      {/* glowing tips */}
      <instancedMesh ref={inst} args={[undefined, undefined, stems.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={new THREE.Color('#8fffbe').multiplyScalar(hovered ? 3.6 : 2.3)} toneMapped={false} />
      </instancedMesh>
      <mesh position={[0, 1.2, 0]} visible={false}>
        <boxGeometry args={[7.5, 3, 6]} />
      </mesh>
      <pointLight position={[0, 1.4, 0]} color="#5fe89a" intensity={hovered ? 18 : 10} distance={13} decay={2} />
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={3.4} />
    </group>
  )
}

/* Pink Triangle on the far ridge — the skyline */
function PinkTriangle({ def, onEnter }: { def: PortalDef; onEnter: NightFieldProps['onEnter'] }) {
  const [hovered, handlers] = usePortalHover()
  const tri: [number, number, number][] = [
    [-3.4, 0, 0],
    [3.4, 0, 0],
    [0, 4.6, 0],
    [-3.4, 0, 0],
  ]
  return (
    <group
      position={[-8, 7, -78]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      <Line points={tri} color={new THREE.Color('#ff5fa2').multiplyScalar(hovered ? 4 : 2.6)} lineWidth={2} toneMapped={false} />
      <mesh position={[0, 2.2, 0]} visible={false}>
        <boxGeometry args={[8, 6, 3]} />
      </mesh>
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={5.6} />
    </group>
  )
}

/* Cracked playa mud (FLORA, tileable) — the point lights reveal it */
function Ground() {
  const tex = useTexture('/textures/playa-tile.webp')
  const configured = useMemo(() => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(26, 18)
    tex.anisotropy = 8
    return tex
  }, [tex])
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -40]}>
      <planeGeometry args={[600, 400]} />
      <meshStandardMaterial
        map={configured}
        bumpMap={configured}
        bumpScale={0.35}
        color="#c9ccd1"
        roughness={0.95}
        metalness={0}
      />
    </mesh>
  )
}

/* Distant ridge silhouettes */
function Ridge() {
  const geom = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-160, 0)
    const peaks = [8, 14, 6, 18, 10, 22, 9, 15, 7]
    peaks.forEach((p, i) => {
      shape.lineTo(-160 + (i + 1) * 36, p)
    })
    shape.lineTo(200, 0)
    shape.lineTo(-160, 0)
    return new THREE.ShapeGeometry(shape)
  }, [])
  return (
    <mesh geometry={geom} position={[0, 0, -85]}>
      <meshBasicMaterial color="#0b0c0f" />
    </mesh>
  )
}

function Rig({ reducedMotion }: { reducedMotion: boolean }) {
  useFrame(({ camera, pointer, clock, size }) => {
    const aspect = size.width / size.height
    const targetZ = aspect < 0.75 ? 44 : aspect < 1.15 ? 30 : 22
    camera.position.z += (targetZ - camera.position.z) * 0.08
    if (reducedMotion) {
      camera.lookAt(aspect < 0.75 ? 3 : 0, 2.5, -18)
      return
    }
    const t = clock.elapsedTime
    const targetX = pointer.x * 3 + Math.sin(t * 0.08) * 0.6
    const targetY = 5.2 + pointer.y * 1.2
    camera.position.x += (targetX - camera.position.x) * 0.04
    camera.position.y += (targetY - camera.position.y) * 0.04
    camera.lookAt(aspect < 0.75 ? 3 : 0, 2.5, -18)
  })
  return null
}

const PORTALS: Record<string, PortalDef> = {
  art: { id: 'art', label: 'After dark', sub: 'Light installations', href: '/art' },
  work: { id: 'work', label: 'Work', sub: 'A decade of AI in production', href: '/work' },
  thinking: { id: 'thinking', label: 'Thinking', sub: 'Trade-offs, not clean answers', href: '/thinking' },
  contact: { id: 'contact', label: "Let's talk", sub: 'oliver@newth.ai', href: '/contact' },
  garden: { id: 'garden', label: 'The garden', sub: '250+ notes, growing', href: 'https://garden.n3wth.com', external: true },
  triangle: { id: 'triangle', label: 'After dark', sub: 'Pink Triangle, Twin Peaks', href: '/art' },
}

export default function NightField({ onEnter, reducedMotion }: NightFieldProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 5.2, 22], fov: 48 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      frameloop={reducedMotion ? 'demand' : 'always'}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#08090b']} />
      <fog attach="fog" args={['#08090b', 34, 140]} />
      <ambientLight intensity={0.06} />

      {/* the playa — flat base always present; the FLORA cracked-mud
          texture suspends in on top, revealed by the pooled light */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -40]}>
        <planeGeometry args={[600, 400]} />
        <meshStandardMaterial color="#101114" roughness={0.95} metalness={0} />
      </mesh>
      <Suspense fallback={null}>
        <Ground />
      </Suspense>
      <Ridge />
      <Stars radius={220} depth={40} count={900} factor={3} saturation={0} fade speed={reducedMotion ? 0 : 0.4} />

      <Them def={PORTALS.art} onEnter={onEnter} reducedMotion={reducedMotion} />
      <Constellation def={PORTALS.work} onEnter={onEnter} reducedMotion={reducedMotion} />
      <Fork def={PORTALS.thinking} onEnter={onEnter} reducedMotion={reducedMotion} />
      <Beacon def={PORTALS.contact} onEnter={onEnter} reducedMotion={reducedMotion} />
      <GardenPatch def={PORTALS.garden} onEnter={onEnter} reducedMotion={reducedMotion} />
      <PinkTriangle def={PORTALS.triangle} onEnter={onEnter} />

      <Rig reducedMotion={reducedMotion} />

      <EffectComposer>
        <Bloom intensity={0.85} luminanceThreshold={1} mipmapBlur radius={0.75} />
      </EffectComposer>
    </Canvas>
  )
}
