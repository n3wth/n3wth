import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, Stars, useCursor } from '@react-three/drei'
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
    const v: [number, number, number][] = [
      [-2.2, 0, 0.6], [0.4, 0, -0.8], [2.4, 0, 0.4],
      [-1.4, 2.6, 0.2], [1.4, 2.9, -0.3],
      [-2.5, 4.3, -0.2], [-0.1, 5.0, 0.3], [2.5, 4.1, -0.4],
      [-1.2, 6.6, 0], [1.3, 6.4, 0.2],
      [0.1, 7.9, -0.1],
    ]
    const e: [number, number][] = [
      [0, 3], [1, 3], [1, 4], [2, 4], [3, 5], [3, 6], [4, 6], [4, 7],
      [5, 8], [6, 8], [6, 9], [7, 9], [8, 10], [9, 10], [5, 6], [6, 7], [8, 9],
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

/* Work — a grid of lights dissolving into a constellation */
function Constellation({ def, onEnter, reducedMotion }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean }) {
  const [hovered, handlers] = usePortalHover()
  const inst = useRef<THREE.InstancedMesh>(null)

  const pts = useMemo(() => {
    const out: THREE.Vector3[] = []
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 4; j++) {
        const scatter = i > 3 ? (i - 3) * 0.9 : 0
        out.push(
          new THREE.Vector3(
            i * 1.5 + (scatter ? Math.sin(i * 5 + j * 3) * scatter : 0),
            1 + j * 1.5 + (scatter ? Math.cos(i * 3 + j * 7) * scatter : 0),
            scatter ? Math.sin(i * 7 + j) * 1.4 : 0
          )
        )
      }
    }
    return out
  }, [])

  useFrame(({ clock }) => {
    const mesh = inst.current
    if (!mesh) return
    const t = reducedMotion ? 0 : clock.elapsedTime
    const dummy = new THREE.Object3D()
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]
      dummy.position.set(p.x, p.y + (reducedMotion ? 0 : Math.sin(t * 1.3 + i) * 0.05), p.z)
      const s = 0.09 + (i % 5) * 0.015
      dummy.scale.setScalar(s * (hovered ? 1.5 : 1))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <group
      position={[-25, 0, -27]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      <instancedMesh ref={inst} args={[undefined, undefined, pts.length]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color={new THREE.Color('#9fc4ff').multiplyScalar(hovered ? 4 : 2.4)} toneMapped={false} />
      </instancedMesh>
      <mesh position={[4.5, 3.2, 0]} visible={false}>
        <boxGeometry args={[11, 7, 4]} />
      </mesh>
      <pointLight position={[4.5, 2.5, 1]} color="#7ea8e8" intensity={hovered ? 26 : 14} distance={22} decay={2} />
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={7.6} />
    </group>
  )
}

/* Thinking — a path of light that forks on the ground */
function Fork({ def, onEnter, reducedMotion }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean }) {
  const [hovered, handlers] = usePortalHover()

  const [stem, left, right] = useMemo(() => {
    const mk = (pts: [number, number, number][]) =>
      new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))).getPoints(40).map((v) => [v.x, v.y, v.z] as [number, number, number])
    return [
      mk([[-3.5, 0.06, 9], [-1.5, 0.06, 4], [0, 0.06, 0]]),
      mk([[0, 0.06, 0], [1.6, 0.06, -3.4], [4.6, 0.06, -6.4]]),
      mk([[0, 0.06, 0], [0.6, 0.06, -4], [0.4, 0.06, -8.5]]),
    ]
  }, [])

  const glow = hovered ? 3.6 : 2.1
  void reducedMotion

  return (
    <group
      position={[3, 0, -7]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      {[stem, left, right].map((pts, i) => (
        <Line key={i} points={pts} color={new THREE.Color('#8fdfff').multiplyScalar(glow)} lineWidth={2.2} toneMapped={false} />
      ))}
      <mesh position={[0.5, 0.3, 0]} rotation-x={-Math.PI / 2} visible={false}>
        <planeGeometry args={[10, 19]} />
      </mesh>
      <pointLight position={[0, 1.2, -1]} color="#79c8ea" intensity={hovered ? 16 : 8} distance={14} decay={2} />
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={2.6} />
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

  return (
    <group
      position={[26, 0, -30]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      <mesh ref={core} position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color={new THREE.Color('#ffb877').multiplyScalar(hovered ? 5 : 3.4)} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <coneGeometry args={[0.9, 0.9, 4, 1, true]} />
        <meshStandardMaterial color="#1a1410" roughness={1} />
      </mesh>
      <mesh position={[0, 1.6, 0]} visible={false}>
        <sphereGeometry args={[2.6, 8, 8]} />
      </mesh>
      <pointLight ref={light} position={[0, 1.8, 0]} color="#ff9d4d" intensity={26} distance={30} decay={2} />
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={3.4} />
    </group>
  )
}

/* The garden — a patch of small green lights */
function GardenPatch({ def, onEnter, reducedMotion }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean }) {
  const [hovered, handlers] = usePortalHover()
  const inst = useRef<THREE.InstancedMesh>(null)

  const pts = useMemo(() => {
    const out: { x: number; z: number; h: number }[] = []
    for (let i = 0; i < 34; i++) {
      const a = i * 2.399
      const r = 0.7 + (i % 9) * 0.42
      out.push({ x: Math.cos(a) * r, z: Math.sin(a) * r * 0.8, h: 0.3 + (i % 5) * 0.28 })
    }
    return out
  }, [])

  useFrame(({ clock }) => {
    const mesh = inst.current
    if (!mesh) return
    const t = reducedMotion ? 0 : clock.elapsedTime
    const dummy = new THREE.Object3D()
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]
      const sway = reducedMotion ? 0 : Math.sin(t * 1.6 + i * 1.9) * 0.05
      dummy.position.set(p.x + sway, p.h, p.z)
      dummy.scale.setScalar((0.05 + (i % 4) * 0.014) * (hovered ? 1.6 : 1))
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
      <instancedMesh ref={inst} args={[undefined, undefined, pts.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={new THREE.Color('#8fffbe').multiplyScalar(hovered ? 3.6 : 2.2)} toneMapped={false} />
      </instancedMesh>
      <mesh position={[0, 0.9, 0]} visible={false}>
        <boxGeometry args={[7, 2.4, 6]} />
      </mesh>
      <pointLight position={[0, 1.4, 0]} color="#5fe89a" intensity={hovered ? 18 : 10} distance={13} decay={2} />
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={2.8} />
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
  useFrame(({ camera, pointer, clock }) => {
    if (reducedMotion) return
    const t = clock.elapsedTime
    const targetX = pointer.x * 3 + Math.sin(t * 0.08) * 0.6
    const targetY = 5.2 + pointer.y * 1.2
    camera.position.x += (targetX - camera.position.x) * 0.04
    camera.position.y += (targetY - camera.position.y) * 0.04
    camera.lookAt(0, 2.5, -18)
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

      {/* the playa */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -40]}>
        <planeGeometry args={[600, 400]} />
        <meshStandardMaterial color="#101114" roughness={0.95} metalness={0} />
      </mesh>
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
