import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, Stars, useCursor, useGLTF, useTexture } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'

/**
 * The front door as a real night field (three.js): every glowing
 * structure is one of Oliver's works standing in for a page, bloom makes
 * the light actually glow, and each structure's point light pools its
 * color on the ground — the only color on the site.
 *
 * The sculptures are real geometry — steel-tube frames, boards, logs —
 * modeled headless in Blender and shipped as one GLB
 * (public/models/sculptures.glb, built by scripts in the session
 * scratchpad). The sky is a FLORA Milky Way panorama on a cylinder.
 *
 * Navigation is passed in as a callback because r3f's Canvas is its own
 * React tree: router context doesn't cross the bridge.
 */

const MODELS = '/models/sculptures.glb'
useGLTF.preload(MODELS)

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

/* A glowing Blender-built sculpture: one emissive material breathing
   above the bloom threshold, an invisible hit volume, a pooled light. */
function GlowSculpture({
  def,
  onEnter,
  reducedMotion,
  geometry,
  position,
  rotation = [0, 0, 0],
  color,
  lightColor,
  base,
  hoverBoost = 1.5,
  wave = 0.4,
  speed = 1.1,
  hit,
  hitY,
  lightY,
  lightIntensity,
  lightHoverIntensity,
  lightDistance,
  labelY,
  children,
}: {
  def: PortalDef
  onEnter: NightFieldProps['onEnter']
  reducedMotion: boolean
  geometry: THREE.BufferGeometry
  position: [number, number, number]
  rotation?: [number, number, number]
  color: string
  lightColor: string
  base: number
  hoverBoost?: number
  wave?: number
  speed?: number
  hit: [number, number, number]
  hitY: number
  lightY: number
  lightIntensity: number
  lightHoverIntensity: number
  lightDistance: number
  labelY: number
  children?: React.ReactNode
}) {
  const [hovered, handlers] = usePortalHover()
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const baseColor = useMemo(() => new THREE.Color(color), [color])

  useFrame(({ clock }) => {
    if (!mat.current) return
    const t = reducedMotion ? 0 : clock.elapsedTime
    const breathe = base + Math.sin(t * speed) * wave + (hovered ? hoverBoost : 0)
    mat.current.color.copy(baseColor).multiplyScalar(breathe)
  })

  return (
    <group
      position={position}
      rotation={rotation}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      <mesh geometry={geometry}>
        <meshBasicMaterial ref={mat} color={baseColor.clone().multiplyScalar(base)} toneMapped={false} />
      </mesh>
      <mesh position={[0, hitY, 0]} visible={false}>
        <boxGeometry args={hit} />
      </mesh>
      <pointLight
        position={[0, lightY, 0]}
        color={lightColor}
        intensity={hovered ? lightHoverIntensity : lightIntensity}
        distance={lightDistance}
        decay={2}
      />
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={labelY} />
      {children}
    </group>
  )
}

function CraneLoad({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return
    ref.current.position.y = 6.2 + Math.sin(clock.elapsedTime * 0.7) * 0.35
  })
  return (
    <mesh ref={ref} position={[3.1, 6.2, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshBasicMaterial color={new THREE.Color('#c3dcff').multiplyScalar(2.2)} toneMapped={false} />
    </mesh>
  )
}

/* Thinking — diverging paths of light under the Blender signpost */
function ForkPaths({ hovered }: { hovered: boolean }) {
  const paths = useMemo(() => {
    const mk = (pts: [number, number, number][]) =>
      new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)))
        .getPoints(30)
        .map((v) => [v.x, v.y, v.z] as [number, number, number])
    return [
      mk([[0, 0.06, 0.4], [1.6, 0.06, -1.8], [3.6, 0.06, -3.6]]),
      mk([[0, 0.06, 0.4], [-1.4, 0.06, -1.9], [-3.2, 0.06, -3.9]]),
    ]
  }, [])
  return (
    <>
      {paths.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color={new THREE.Color('#8fdfff').multiplyScalar(hovered ? 3.4 : 2)}
          lineWidth={2}
          toneMapped={false}
        />
      ))}
    </>
  )
}

function Fork({ def, onEnter, reducedMotion, geometry }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean; geometry: THREE.BufferGeometry }) {
  const [hovered, handlers] = usePortalHover()
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const baseColor = useMemo(() => new THREE.Color('#8fdfff'), [])

  useFrame(({ clock }) => {
    if (!mat.current) return
    const t = reducedMotion ? 0 : clock.elapsedTime
    mat.current.color.copy(baseColor).multiplyScalar(2.1 + Math.sin(t * 1.3) * 0.3 + (hovered ? 1.4 : 0))
  })

  return (
    <group
      position={[1, 0, -5]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      <mesh geometry={geometry}>
        <meshBasicMaterial ref={mat} color={baseColor.clone().multiplyScalar(2.1)} toneMapped={false} />
      </mesh>
      <ForkPaths hovered={hovered} />
      <mesh position={[0, 2.4, 0]} visible={false}>
        <boxGeometry args={[5.4, 5.4, 3]} />
      </mesh>
      <pointLight position={[0, 2.4, 0.6]} color="#79c8ea" intensity={hovered ? 18 : 9} distance={14} decay={2} />
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={5.8} />
    </group>
  )
}

/* Contact — a real campfire: Blender logs and a stone ring lit by the
   flickering flame light, embers rising */
function Beacon({ def, onEnter, reducedMotion, logs, stones }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean; logs: THREE.BufferGeometry; stones: THREE.BufferGeometry }) {
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
      position={[-4.5, 0, -2]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      <mesh geometry={logs}>
        <meshStandardMaterial color="#4a3524" roughness={1} metalness={0} />
      </mesh>
      <mesh geometry={stones}>
        <meshStandardMaterial color="#23252a" roughness={1} metalness={0} />
      </mesh>
      <mesh ref={core} position={[0, 1.05, 0]}>
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

/* Pink Triangle in front of the far ridge — the skyline */
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
      position={[-17, 6.8, -72]}
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

/* The Milky Way (FLORA astrophotography) on a far cylinder — unfogged,
   its black bottom fifth dissolving into the fog line */
function Sky() {
  const tex = useTexture('/textures/sky-pano.webp')
  const configured = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [tex])
  const arc = 2.4
  return (
    <mesh position={[0, 76, 0]}>
      <cylinderGeometry args={[185, 185, 188, 48, 1, true, Math.PI - arc / 2, arc]} />
      <meshBasicMaterial map={configured} color="#d6dade" side={THREE.BackSide} fog={false} toneMapped={false} />
    </mesh>
  )
}

/* Blender-built distant range replacing the flat silhouette: real
   geometry so the skyline is jagged and the fog gives it depth */
function Ridge({ geometry }: { geometry: THREE.BufferGeometry }) {
  return (
    <mesh geometry={geometry} position={[0, 0, -85]}>
      <meshStandardMaterial color="#0d0e12" roughness={1} metalness={0} />
    </mesh>
  )
}

/* Everything that waits on the GLB: sculptures + terrain */
function Sculptures({ onEnter, reducedMotion }: NightFieldProps) {
  const { nodes } = useGLTF(MODELS) as unknown as { nodes: Record<string, THREE.Mesh> }
  return (
    <>
      <GlowSculpture
        def={PORTALS.art}
        onEnter={onEnter}
        reducedMotion={reducedMotion}
        geometry={nodes.them.geometry}
        position={[10, 0, -14]}
        rotation={[0, -0.38, 0]}
        color="#ffdda8"
        lightColor="#ffce8a"
        base={2}
        wave={0.45}
        speed={1.1}
        hit={[6.5, 9, 3]}
        hitY={4}
        lightY={3.5}
        lightIntensity={22}
        lightHoverIntensity={40}
        lightDistance={26}
        labelY={9.4}
      />
      <GlowSculpture
        def={PORTALS.work}
        onEnter={onEnter}
        reducedMotion={reducedMotion}
        geometry={nodes.tower.geometry}
        position={[25.5, 0, -33]}
        color="#9fc4ff"
        lightColor="#7ea8e8"
        base={2.1}
        wave={0.3}
        speed={0.9}
        hit={[8, 9.5, 4.5]}
        hitY={4.2}
        lightY={3.4}
        lightIntensity={16}
        lightHoverIntensity={28}
        lightDistance={22}
        labelY={9.2}
      >
        <CraneLoad reducedMotion={reducedMotion} />
      </GlowSculpture>
      <Fork def={PORTALS.thinking} onEnter={onEnter} reducedMotion={reducedMotion} geometry={nodes.signpost.geometry} />
      <Beacon
        def={PORTALS.contact}
        onEnter={onEnter}
        reducedMotion={reducedMotion}
        logs={nodes.firelogs.geometry}
        stones={nodes.stones.geometry}
      />
      <Ridge geometry={nodes.terrain_ridge.geometry} />
    </>
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
      <Suspense fallback={null}>
        <Sky />
      </Suspense>
      <Stars radius={110} depth={30} count={420} factor={2.6} saturation={0} fade speed={reducedMotion ? 0 : 0.4} />

      <Suspense fallback={null}>
        <Sculptures onEnter={onEnter} reducedMotion={reducedMotion} />
      </Suspense>
      <Suspense fallback={null}>
        <GardenPatch def={PORTALS.garden} onEnter={onEnter} reducedMotion={reducedMotion} />
        <PinkTriangle def={PORTALS.triangle} onEnter={onEnter} />
      </Suspense>

      <Rig reducedMotion={reducedMotion} />

      <EffectComposer>
        <Bloom intensity={0.85} luminanceThreshold={1} mipmapBlur radius={0.75} />
      </EffectComposer>
    </Canvas>
  )
}
