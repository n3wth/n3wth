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

/* A pool of light on the playa — additive radial gradient, the way a
   real lamp reveals the ground around it */
const poolTexture = (() => {
  let tex: THREE.CanvasTexture | null = null
  return () => {
    if (tex) return tex
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64)
    g.addColorStop(0, 'rgba(255,255,255,0.9)')
    g.addColorStop(0.45, 'rgba(255,255,255,0.35)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    tex = new THREE.CanvasTexture(c)
    return tex
  }
})()

function LightPool({ position, scale = 1, color, opacity }: { position: [number, number, number]; scale?: number; color: string; opacity: number }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={position} scale={scale} renderOrder={1}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={poolTexture()}
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
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

/* Pull mesh geometries out of a GLB scene, keyed by lowercase node name */
function useGLBGeometries(url: string): Record<string, THREE.BufferGeometry> {
  const { scene } = useGLTF(url)
  return useMemo(() => {
    const out: Record<string, THREE.BufferGeometry> = {}
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) out[m.name.toLowerCase()] = m.geometry
    })
    return out
  }, [scene])
}

/* Pull the first mesh geometry out of a GLB scene */
function useGLBGeometry(url: string): THREE.BufferGeometry {
  const geos = useGLBGeometries(url)
  const first = Object.values(geos)[0]
  if (!first) throw new Error(`no mesh in ${url}`)
  return first
}

/* A sculpture the way the real ones are built: a solid body wearing a
   real material (FLORA steel or wood), revealed only where the light
   pools, and light running along its edges. */
function SteelAndWire({
  geometry,
  edgeColor,
  edgeThreshold,
  glow,
  breathe,
  reducedMotion,
  mapUrl,
  phase = 0,
  edgeFog = true,
}: {
  geometry: THREE.BufferGeometry
  edgeColor: string
  edgeThreshold: number
  glow: number
  breathe: number
  reducedMotion: boolean
  mapUrl: string
  phase?: number
  edgeFog?: boolean
}) {
  const edges = useMemo(() => {
    const g = new THREE.EdgesGeometry(geometry, edgeThreshold)
    /* real LED rope has bright runs, dim runs, dead edges — give every
       segment its own seeded brightness so nothing glows uniformly */
    const count = g.getAttribute('position').count
    const colors = new Float32Array(count * 3)
    for (let seg = 0; seg < count / 2; seg++) {
      const s = Math.sin(seg * 127.1 + 311.7) * 43758.5453
      const b = 0.35 + 0.65 * (s - Math.floor(s))
      for (const vi of [seg * 2, seg * 2 + 1]) {
        colors[vi * 3] = colors[vi * 3 + 1] = colors[vi * 3 + 2] = b
      }
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return g
  }, [geometry, edgeThreshold])
  const mat = useRef<THREE.LineBasicMaterial>(null)
  const base = useMemo(() => new THREE.Color(edgeColor), [edgeColor])
  const tex = useTexture(mapUrl)
  const configured = useMemo(() => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [tex])

  useFrame(({ clock }) => {
    if (!mat.current) return
    const t = reducedMotion ? 0 : clock.elapsedTime
    const pulse = glow + Math.sin(t * breathe + phase) * 0.12
    mat.current.color.copy(base).multiplyScalar(pulse)
  })

  return (
    <>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          map={configured}
          bumpMap={configured}
          bumpScale={0.6}
          color="#e2e2e2"
          roughness={0.85}
          metalness={0.25}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={mat} vertexColors color={base.clone().multiplyScalar(glow)} toneMapped={false} fog={edgeFog} />
      </lineSegments>
    </>
  )
}

/* THEM — a pack of faceted steel thylacines (modeled in Blender), LED
   wire along the strong creases, light-bar stripes across the back.
   Extinct animals walking again at night: each one ambles a slow loop
   through the pool of light, legs trotting, body rising and falling. */

/* leg pivot points in model space (shoulder/hip joints) */
const LEG_PIVOTS: Record<string, [number, number, number]> = {
  leg_fl: [1.55, 3.35, -0.5],
  leg_fr: [1.55, 3.35, 0.5],
  leg_bl: [-1.6, 3.0, -0.5],
  leg_br: [-1.6, 3.0, 0.5],
}
/* trot: diagonal pairs move together */
const LEG_PHASE: Record<string, number> = { leg_fl: 0, leg_br: 0, leg_fr: Math.PI, leg_bl: Math.PI }

function Thylacine({
  parts,
  hovered,
  reducedMotion,
  scale,
  theta0,
  phase,
}: {
  parts: Record<string, THREE.BufferGeometry>
  hovered: boolean
  reducedMotion: boolean
  scale: number
  theta0: number
  phase: number
}) {
  const walker = useRef<THREE.Group>(null)
  const bodyGroup = useRef<THREE.Group>(null)
  const legRefs = useRef<Record<string, THREE.Group | null>>({})
  const RX = 7.5
  const RZ = 5.5
  const OMEGA = (2 * Math.PI) / 85 // one slow lap in ~85s

  useFrame(({ clock }) => {
    const g = walker.current
    if (!g) return
    const t = reducedMotion ? 0 : clock.elapsedTime
    const th = theta0 - t * OMEGA
    g.position.set(Math.cos(th) * RX, 0, Math.sin(th) * RZ)
    // face along the direction of travel (ellipse tangent)
    g.rotation.y = Math.atan2(Math.cos(th) * RZ, Math.sin(th) * RX)
    const w = 3.4 // leg swing frequency, tuned to stride length
    for (const [name, pivot] of Object.entries(LEG_PIVOTS)) {
      const leg = legRefs.current[name]
      if (leg) leg.rotation.z = reducedMotion ? 0 : Math.sin(t * w + LEG_PHASE[name] + phase) * 0.28
      void pivot
    }
    if (bodyGroup.current) {
      bodyGroup.current.position.y = reducedMotion ? 0 : Math.abs(Math.sin(t * w + phase)) * 0.07
      bodyGroup.current.rotation.x = reducedMotion ? 0 : Math.sin(t * w * 0.5 + phase) * 0.015
    }
  })

  const body = parts['them']
  const stripes = parts['them_stripes']

  return (
    <group ref={walker} scale={scale}>
      <group ref={bodyGroup}>
        {body && (
          <SteelAndWire
            geometry={body}
            edgeColor="#ffdda8"
            edgeThreshold={20}
            glow={hovered ? 2.6 : 1.3}
            breathe={1.1}
            phase={phase}
            reducedMotion={reducedMotion}
            mapUrl="/textures/steel-tile.webp"
          />
        )}
        {stripes && (
          <mesh geometry={stripes}>
            <meshBasicMaterial color={new THREE.Color('#ffdda8').multiplyScalar(hovered ? 2.8 : 1.9)} toneMapped={false} />
          </mesh>
        )}
      </group>
      {Object.entries(LEG_PIVOTS).map(([name, pivot]) => {
        const geo = parts[name]
        if (!geo) return null
        return (
          <group
            key={name}
            position={pivot}
            ref={(el) => {
              legRefs.current[name] = el
            }}
          >
            <group position={[-pivot[0], -pivot[1], -pivot[2]]}>
              <SteelAndWire
                geometry={geo}
                edgeColor="#ffdda8"
                edgeThreshold={20}
                glow={hovered ? 2.2 : 1.1}
                breathe={1.1}
                phase={phase + 2}
                reducedMotion={reducedMotion}
                mapUrl="/textures/steel-tile.webp"
              />
            </group>
          </group>
        )
      })}
    </group>
  )
}

function Them({ def, onEnter, reducedMotion }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean }) {
  const [hovered, handlers] = usePortalHover()
  const parts = useGLBGeometries('/models/them.glb')

  return (
    <group
      position={[9, 0, -30]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      <Thylacine parts={parts} hovered={hovered} reducedMotion={reducedMotion} scale={1.5} theta0={0} phase={0} />
      <Thylacine parts={parts} hovered={hovered} reducedMotion={reducedMotion} scale={1.2} theta0={1.1} phase={1.7} />
      <Thylacine parts={parts} hovered={hovered} reducedMotion={reducedMotion} scale={0.9} theta0={2.3} phase={3.1} />
      <LightPool position={[0, 0.03, 0]} scale={26} color="#ffce8a" opacity={0.1} />
      {/* invisible hit volume covering the loop the pack walks */}
      <mesh position={[0, 4, 0]} visible={false}>
        <boxGeometry args={[24, 10, 16]} />
      </mesh>
      <pointLight position={[0, 1.6, 0]} color="#ffce8a" intensity={hovered ? 100 : 75} distance={22} decay={2} />
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={9.5} />
    </group>
  )
}

/* Work — a radio telescope (modeled in Blender): faceted dish on a
   lattice pedestal, feed tripod, tilted at the sky and slowly tracking
   something across it. Listening at production scale. */
function Constellation({ def, onEnter, reducedMotion }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean }) {
  const [hovered, handlers] = usePortalHover()
  const parts = useGLBGeometries('/models/dish.glb')
  const mount = parts['dish_mount']
  const head = parts['dish_head']
  const azimuth = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!azimuth.current || reducedMotion) return
    // one slow sweep and back across the sky, like a long observation
    azimuth.current.rotation.y = Math.sin(clock.elapsedTime * 0.045) * 0.55
  })

  return (
    <group
      position={[-34, 0, -85]}
      rotation-y={0.35}
      scale={3}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      {mount && (
        <SteelAndWire
          geometry={mount}
          edgeColor="#9fc4ff"
          edgeThreshold={12}
          glow={hovered ? 2.2 : 1.2}
          breathe={0.8}
          reducedMotion={reducedMotion}
          mapUrl="/textures/steel-tile.webp"
          edgeFog={false}
        />
      )}
      {head && (
        <group ref={azimuth}>
          <SteelAndWire
            geometry={head}
            edgeColor="#9fc4ff"
            edgeThreshold={18}
            glow={hovered ? 2.2 : 1.2}
            breathe={0.8}
            phase={1.2}
            reducedMotion={reducedMotion}
            mapUrl="/textures/steel-tile.webp"
            edgeFog={false}
          />
          {/* red light on the receiver, riding the sweep */}
          <Beacon2 reducedMotion={reducedMotion} position={[0, 5.75, -1.72]} />
        </group>
      )}
      <mesh position={[0, 4.5, 0]} visible={false}>
        <boxGeometry args={[9, 10, 8]} />
      </mesh>
      <pointLight position={[0, 1.5, 0]} color="#7ea8e8" intensity={hovered ? 60 : 35} distance={30} decay={2} />
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={9.5} />
    </group>
  )
}

/* Slow red pulse at the tower apex — the universal "tall thing at
   night" signal */
function Beacon2({ reducedMotion, position = [0, 10.5, 0] }: { reducedMotion: boolean; position?: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = reducedMotion ? 0 : clock.elapsedTime
    const on = (Math.sin(t * 1.6) + 1) / 2
    const m = ref.current.material as THREE.MeshBasicMaterial
    m.color.set('#ff2d2d').multiplyScalar(0.6 + on * 2.6)
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.13, 8, 8]} />
      <meshBasicMaterial color="#ff2d2d" toneMapped={false} fog={false} />
    </mesh>
  )
}

/* Thinking — a signpost at a fork (modeled in Blender): two arrow
   boards pointing apart, two light paths actually diverging beneath it */
function Fork({ def, onEnter, reducedMotion }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean }) {
  const [hovered, handlers] = usePortalHover()
  const parts = useGLBGeometries('/models/signpost.glb')
  const post = Object.entries(parts).find(([k]) => k.endsWith('_post'))?.[1]
  const boards = Object.entries(parts).find(([k]) => k.endsWith('_boards'))?.[1]
  const boardEdges = useMemo(() => (boards ? new THREE.EdgesGeometry(boards, 12) : null), [boards])
  const suzParts = useGLBGeometries('/models/suzanne.glb')
  const suzanne = Object.entries(suzParts).find(([k]) => k.includes('suzanne'))?.[1]
  const plinth = Object.entries(suzParts).find(([k]) => k.includes('plinth'))?.[1]

  /* two rows of dim marker stones diverging where the paths split */
  const markers = useMemo(() => {
    const rows: { x: number; z: number; s: number }[] = []
    for (let i = 0; i < 5; i++) {
      const d = 1.3 + i * 0.85
      rows.push({ x: d * 0.55, z: -d, s: 0.1 + (i % 2) * 0.025 })
      rows.push({ x: -d * 0.5, z: -d * 1.05, s: 0.11 - (i % 2) * 0.02 })
    }
    return rows
  }, [])

  const glow = hovered ? 2.2 : 1.2

  return (
    <group
      position={[6.5, 0, 4]}
      rotation-y={0.45}
      scale={0.7}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      {post && (
        <SteelAndWire
          geometry={post}
          edgeColor="#d9cba4"
          edgeThreshold={12}
          glow={glow}
          breathe={1.3}
          reducedMotion={reducedMotion}
          mapUrl="/textures/wood-tile.webp"
        />
      )}
      {/* the arrow boards, half-lit like a sign at the edge of firelight */}
      {boards && (
        <mesh geometry={boards}>
          <meshBasicMaterial color={new THREE.Color('#0d1e26').multiplyScalar(hovered ? 1.5 : 1)} toneMapped={false} />
        </mesh>
      )}
      {boardEdges && (
        <lineSegments geometry={boardEdges}>
          <lineBasicMaterial color={new THREE.Color('#d9cba4').multiplyScalar(glow)} toneMapped={false} />
        </lineSegments>
      )}
      {markers.map((m, i) => (
        <mesh key={i} position={[m.x, m.s * 0.6, m.z]} rotation-y={i * 1.7} scale={m.s}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#3a362f" roughness={0.98} />
        </mesh>
      ))}
      {/* Suzanne on a plinth beside the fork, thinking it over */}
      <group position={[-1.9, 0, 1.1]} rotation-y={0.9}>
        {plinth && (
          <mesh geometry={plinth}>
            <meshStandardMaterial color="#57524a" roughness={0.95} />
          </mesh>
        )}
        {suzanne && (
          <mesh geometry={suzanne}>
            <meshStandardMaterial color="#8a8078" roughness={0.85} metalness={0.15} />
          </mesh>
        )}
        {/* her own little reading lamp */}
        <pointLight position={[0.5, 2.6, 0.8]} color="#d8c294" intensity={4} distance={5} decay={2} />
      </group>
      <LightPool position={[0, 0.03, 0]} scale={5.5} color="#d9cba4" opacity={0.08} />
      <mesh position={[0, 2.4, 0]} visible={false}>
        <boxGeometry args={[6.5, 5.4, 3.5]} />
      </mesh>
      <pointLight position={[0, 2.6, 0.8]} color="#d8c294" intensity={hovered ? 26 : 16} distance={10} decay={2} />
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={5.6} />
    </group>
  )
}

/* Procedural fire: fbm noise scrolling up two crossed planes, shaped
   into a flame silhouette — the way fire actually flickers, not a cone */
const FLAME_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`
const FLAME_FRAG = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
  return v;
}
void main() {
  vec2 uv = vUv;
  float n = fbm(vec2(uv.x * 3.0 + uTime * 0.3, uv.y * 3.6 - uTime * 2.4));
  float shape = 1.0 - uv.y;
  float flame = shape * (0.85 + 0.5 * n) - abs(uv.x - 0.5) * (1.6 + 2.2 * uv.y);
  float f = smoothstep(0.02, 0.4, flame);
  float hot = smoothstep(0.25, 0.75, flame);
  vec3 col = mix(vec3(1.0, 0.32, 0.04), vec3(1.0, 0.85, 0.45), hot);
  float alpha = f * (0.55 + 0.45 * n);
  if (alpha < 0.02) discard;
  gl_FragColor = vec4(col * 2.2, alpha);
}`

function Flame({ hovered, reducedMotion }: { hovered: boolean; reducedMotion: boolean }) {
  const mats = useRef<THREE.ShaderMaterial[]>([])
  useFrame(({ clock }) => {
    const t = reducedMotion ? 8 : clock.elapsedTime
    for (const m of mats.current) {
      if (m) m.uniforms.uTime.value = t
    }
  })
  const uniforms = useMemo(() => [{ uTime: { value: 0 } }, { uTime: { value: 5 } }], [])
  return (
    <group position={[0, 0.28, 0]} scale={hovered ? 1.15 : 1}>
      {[0, Math.PI / 2].map((ry, i) => (
        <mesh key={i} rotation-y={ry} position={[0, 0.85, 0]}>
          <planeGeometry args={[1.5, 1.9]} />
          <shaderMaterial
            ref={(el: THREE.ShaderMaterial | null) => {
              if (el) mats.current[i] = el
            }}
            vertexShader={FLAME_VERT}
            fragmentShader={FLAME_FRAG}
            uniforms={uniforms[i]}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/* Contact — a real campfire: a teepee of wooden logs (FLORA wood, lit
   by its own flame), a ring of playa stones, embers rising */
function Beacon({ def, onEnter, reducedMotion }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean }) {
  const [hovered, handlers] = usePortalHover()
  const light = useRef<THREE.PointLight>(null)
  const core = useRef<THREE.Mesh>(null)
  const wood = useTexture('/textures/wood-tile.webp')
  const teapot = useGLBGeometry('/models/teapot.glb')

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.elapsedTime
    const flicker = 1 + Math.sin(t * 7.3) * 0.08 + Math.sin(t * 13.7) * 0.05
    if (light.current) light.current.intensity = (hovered ? 100 : 60) * flicker
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 2.1) * 0.06)
  })

  const { logs, stones } = useMemo(() => {
    const rnd = (i: number, salt: number) => {
      const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
      return x - Math.floor(x)
    }
    const up = new THREE.Vector3(0, 1, 0)
    /* nothing about a real woodpile is regular: every log gets its own
       length, thickness, lean, and one lies fallen outside the teepee */
    const logs = Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2 + 0.4 + (rnd(i, 1) - 0.5) * 0.5
      const rBase = 1.0 + rnd(i, 2) * 0.35
      const base = new THREE.Vector3(Math.cos(a) * rBase, 0.08, Math.sin(a) * rBase)
      const tip = new THREE.Vector3(
        Math.cos(a + Math.PI) * (0.05 + rnd(i, 3) * 0.3),
        1.25 + rnd(i, 4) * 0.45,
        Math.sin(a + Math.PI) * (0.05 + rnd(i, 3) * 0.3)
      )
      const dir = tip.clone().sub(base)
      const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize())
      return {
        pos: base.clone().add(tip).multiplyScalar(0.5),
        quat,
        len: dir.length() + 0.15 + rnd(i, 5) * 0.35,
        r1: 0.045 + rnd(i, 6) * 0.03,
        r2: 0.06 + rnd(i, 7) * 0.035,
        tone: 0.75 + rnd(i, 8) * 0.5,
        twist: rnd(i, 9) * Math.PI,
      }
    })
    // one log that never made it onto the pile
    logs.push({
      pos: new THREE.Vector3(-1.9, 0.09, 1.4),
      quat: new THREE.Quaternion().setFromUnitVectors(up, new THREE.Vector3(0.96, 0.05, 0.28).normalize()),
      len: 1.7,
      r1: 0.06,
      r2: 0.08,
      tone: 0.9,
      twist: 1.2,
    })
    const stones = Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 + 0.15 + (rnd(i, 10) - 0.5) * 0.4
      const r = 1.75 + rnd(i, 11) * 0.4
      return {
        pos: new THREE.Vector3(Math.cos(a) * r, 0.1 + rnd(i, 12) * 0.05, Math.sin(a) * r),
        scale: 0.13 + rnd(i, 13) * 0.11,
        rot: i * 1.3,
        squash: 0.7 + rnd(i, 14) * 0.5,
        tone: 0.8 + rnd(i, 15) * 0.45,
      }
    })
    return { logs, stones }
  }, [])

  return (
    <group
      position={[-8, 0, 9]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      {/* the Utah teapot, waiting by the fire for whoever shows up */}
      <mesh geometry={teapot} position={[2.3, 0, 1.1]} rotation-y={-2.1} scale={0.9}>
        <meshStandardMaterial color="#7a7168" roughness={0.6} metalness={0.35} />
      </mesh>
      {/* teepee of real logs, each one different, lit by their own fire */}
      {logs.map((l, i) => (
        <mesh key={i} position={l.pos} quaternion={l.quat} rotation-order="YXZ">
          <cylinderGeometry args={[l.r1, l.r2, l.len, 5]} />
          <meshStandardMaterial
            map={wood}
            color={new THREE.Color('#8a7f70').multiplyScalar(l.tone)}
            roughness={0.95}
          />
        </mesh>
      ))}
      {/* stone ring, kicked slightly out of true */}
      {stones.map((s, i) => (
        <mesh key={i} position={s.pos} rotation-y={s.rot} scale={[s.scale, s.scale * s.squash, s.scale]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={new THREE.Color('#5c564e').multiplyScalar(s.tone)} roughness={0.98} />
        </mesh>
      ))}
      {/* embers glowing low in the pit */}
      <mesh ref={core} position={[0, 0.18, 0]} scale={[1.2, 0.5, 1.2]}>
        <sphereGeometry args={[0.32, 10, 10]} />
        <meshBasicMaterial color={new THREE.Color('#ff7b2d').multiplyScalar(hovered ? 3.6 : 2.8)} toneMapped={false} />
      </mesh>
      {/* the flames themselves */}
      <Flame hovered={hovered} reducedMotion={reducedMotion} />
      <LightPool position={[0, 0.025, 0]} scale={9} color="#ff9d4d" opacity={0.22} />
      <Embers hovered={hovered} reducedMotion={reducedMotion} />
      <mesh position={[0, 1.2, 0]} visible={false}>
        <sphereGeometry args={[2.8, 8, 8]} />
      </mesh>
      <pointLight ref={light} position={[0, 0.9, 0]} color="#ff9d4d" intensity={60} distance={16} decay={2} />
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={3.2} />
    </group>
  )
}

function Embers({ hovered, reducedMotion }: { hovered: boolean; reducedMotion: boolean }) {
  const inst = useRef<THREE.InstancedMesh>(null)
  const N = 5
  const phases = useMemo(() => Array.from({ length: N }, (_, i) => {
    const s = Math.sin(i * 91.7 + 47.3) * 43758.5453
    return s - Math.floor(s)
  }), [])
  useFrame(({ clock }) => {
    const mesh = inst.current
    if (!mesh) return
    const t = reducedMotion ? 0 : clock.elapsedTime
    const dummy = new THREE.Object3D()
    for (let i = 0; i < N; i++) {
      const cycle = (t * 0.5 + phases[i]) % 1
      dummy.position.set(
        Math.sin(i * 5.1 + cycle * 6) * 0.6 + Math.sin(t * 0.8 + i * 7) * 0.25,
        1.0 + cycle * 2.4,
        Math.cos(i * 3.7 + cycle * 5) * 0.5
      )
      dummy.scale.setScalar(0.035 * (1 - cycle) + 0.012)
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

/* The garden — an actual planted bed at night: curved stems with leaf
   blades, glowing bud tips, and a few tall alliums holding orbs of
   light over the rest. The plant-glyph language of garden.n3wth.com. */
function GardenPatch({ def, onEnter, reducedMotion }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean }) {
  const [hovered, handlers] = usePortalHover()
  const tips = useRef<THREE.InstancedMesh>(null)
  const orbs = useRef<THREE.InstancedMesh>(null)

  const { stemGeo, plants, alliums } = useMemo(() => {
    const rnd = (i: number, salt: number) => {
      const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
      return x - Math.floor(x)
    }
    const plants: { x: number; z: number; h: number; lean: number }[] = []
    const pts: number[] = []
    const seg = (a: THREE.Vector3, b: THREE.Vector3) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z)

    for (let i = 0; i < 44; i++) {
      const a = i * 2.399
      const r = (0.5 + rnd(i, 1) * 3.1) * (1 - 0.12 * Math.sin(a * 2))
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r * 0.7
      const h = 0.5 + rnd(i, 2) * 1.3
      const lean = (rnd(i, 3) - 0.5) * 0.5
      plants.push({ x, z, h, lean })
      const base = new THREE.Vector3(x, 0, z)
      const mid = new THREE.Vector3(x + lean * 0.4, h * 0.55, z)
      const tip = new THREE.Vector3(x + lean, h, z)
      seg(base, mid)
      seg(mid, tip)
      // leaf blades off most stems
      if (rnd(i, 4) > 0.35) {
        const ly = h * (0.3 + rnd(i, 5) * 0.25)
        const dir = rnd(i, 6) > 0.5 ? 1 : -1
        seg(
          new THREE.Vector3(x + lean * 0.25, ly, z),
          new THREE.Vector3(x + lean * 0.25 + 0.4 * dir, ly + 0.28, z + (rnd(i, 7) - 0.5) * 0.3)
        )
      }
    }

    // tall alliums: bare stems holding orbs above the bed
    const alliums: { x: number; z: number; h: number }[] = []
    for (let i = 0; i < 6; i++) {
      const a = i * 2.399 + 0.9
      const r = 0.6 + rnd(i, 8) * 2.2
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r * 0.7
      const h = 1.9 + rnd(i, 9) * 0.9
      alliums.push({ x, z, h })
      seg(new THREE.Vector3(x, 0, z), new THREE.Vector3(x, h, z))
    }

    const stemGeo = new THREE.BufferGeometry()
    stemGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return { stemGeo, plants, alliums }
  }, [])

  useFrame(({ clock }) => {
    const t = reducedMotion ? 0 : clock.elapsedTime
    const dummy = new THREE.Object3D()
    if (tips.current) {
      for (let i = 0; i < plants.length; i++) {
        const p = plants[i]
        const sway = reducedMotion ? 0 : Math.sin(t * 1.4 + i * 1.9) * 0.05
        dummy.position.set(p.x + p.lean + sway, p.h, p.z)
        dummy.scale.setScalar((0.045 + (i % 4) * 0.014) * (hovered ? 1.5 : 1))
        dummy.updateMatrix()
        tips.current.setMatrixAt(i, dummy.matrix)
      }
      tips.current.instanceMatrix.needsUpdate = true
    }
    if (orbs.current) {
      for (let i = 0; i < alliums.length; i++) {
        const p = alliums[i]
        const bob = reducedMotion ? 0 : Math.sin(t * 0.9 + i * 2.6) * 0.04
        dummy.position.set(p.x, p.h + 0.16 + bob, p.z)
        dummy.scale.setScalar((0.16 + (i % 3) * 0.035) * (hovered ? 1.35 : 1))
        dummy.updateMatrix()
        orbs.current.setMatrixAt(i, dummy.matrix)
      }
      orbs.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group
      position={[-18, 0, -14]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      {/* stems + leaves, one draw call */}
      <lineSegments geometry={stemGeo}>
        <lineBasicMaterial color={new THREE.Color('#6f8f6a').multiplyScalar(hovered ? 1.8 : 1)} toneMapped={false} />
      </lineSegments>
      {/* glowing bud tips */}
      <instancedMesh ref={tips} args={[undefined, undefined, plants.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={new THREE.Color('#d8e8cf').multiplyScalar(hovered ? 2.2 : 1.3)} toneMapped={false} />
      </instancedMesh>
      {/* allium orbs above the bed */}
      <instancedMesh ref={orbs} args={[undefined, undefined, alliums.length]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={new THREE.Color('#e8f0e0').multiplyScalar(hovered ? 2.4 : 1.5)}
          wireframe
          toneMapped={false}
        />
      </instancedMesh>
      <LightPool position={[0, 0.03, 0]} scale={8} color="#9fcf9f" opacity={0.07} />
      <mesh position={[0, 1.4, 0]} visible={false}>
        <boxGeometry args={[8.5, 3.6, 6.5]} />
      </mesh>
      <pointLight position={[0, 1.2, 0]} color="#9fcf9f" intensity={hovered ? 22 : 14} distance={14} decay={2} />
      <PortalLabel visible={hovered} label={def.label} sub={def.sub} y={3.8} />
    </group>
  )
}

/* Pink Triangle on the far ridge — the skyline */
function PinkTriangle({ def, onEnter }: { def: PortalDef; onEnter: NightFieldProps['onEnter'] }) {
  const [hovered, handlers] = usePortalHover()
  const tri: [number, number, number][] = [
    [-3.4, 4.6, 0],
    [3.4, 4.6, 0],
    [0, 0, 0],
    [-3.4, 4.6, 0],
  ]
  const fill = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-3.4, 4.6)
    s.lineTo(3.4, 4.6)
    s.lineTo(0, 0)
    s.closePath()
    return s
  }, [])
  return (
    <group
      position={[82, 13, -128]}
      scale={1.7}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      <Line points={tri} color={new THREE.Color('#ff5fa2').multiplyScalar(hovered ? 2.4 : 1.4)} lineWidth={1.5} toneMapped={false} />
      {/* faint pink wash inside the outline */}
      <mesh position={[0, 0, -0.05]}>
        <shapeGeometry args={[fill]} />
        <meshBasicMaterial color="#ff5fa2" transparent opacity={hovered ? 0.14 : 0.05} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
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
        bumpScale={0.6}
        color="#c9ccd1"
        roughness={0.95}
        metalness={0}
      />
    </mesh>
  )
}

/* The horizon itself is a photograph (FLORA): a real ridge silhouette
   with a far-off light dome — the glow of somewhere else out there.
   Alpha-faded on every edge so it dissolves into the scene's night. */
function Horizon() {
  const tex = useTexture('/textures/horizon.webp')
  return (
    <mesh position={[8, 26, -150]}>
      <planeGeometry args={[420, 224]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} fog={false} toneMapped={false} />
    </mesh>
  )
}

function Rig({ reducedMotion }: { reducedMotion: boolean }) {
  useFrame(({ camera, pointer, clock, size }) => {
    const aspect = size.width / size.height
    const targetZ = aspect < 0.75 ? 44 : aspect < 1.15 ? 30 : 22
    camera.position.z += (targetZ - camera.position.z) * 0.08
    if (reducedMotion) {
      camera.lookAt(aspect < 0.75 ? 3 : 0, 4.5, -30)
      return
    }
    const t = clock.elapsedTime
    const targetX = pointer.x * 3 + Math.sin(t * 0.08) * 0.6
    const targetY = 3.2 + pointer.y * 1.2
    camera.position.x += (targetX - camera.position.x) * 0.04
    camera.position.y += (targetY - camera.position.y) * 0.04
    camera.lookAt(aspect < 0.75 ? 3 : 0, 4.5, -30)
  })
  return null
}

useGLTF.preload('/models/them.glb')
useGLTF.preload('/models/dish.glb')
useGLTF.preload('/models/signpost.glb')
useGLTF.preload('/models/suzanne.glb')
useGLTF.preload('/models/teapot.glb')
useTexture.preload('/textures/playa-tile.webp')
useTexture.preload('/textures/horizon.webp')
useTexture.preload('/textures/steel-tile.webp')
useTexture.preload('/textures/wood-tile.webp')

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
      camera={{ position: [0, 3.2, 22], fov: 48 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      frameloop={reducedMotion ? 'demand' : 'always'}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#08090b']} />
      <fog attach="fog" args={['#08090b', 28, 115]} />
      <ambientLight intensity={0.06} />
      <hemisphereLight args={['#141720', '#0a0908']} intensity={0.25} />
      {/* the far glow behind the ridge throws the faintest warm light
          across the playa — enough to give the steel bodies shape */}
      <directionalLight position={[-6, 18, -120]} color="#8a7a68" intensity={0.4} />

      {/* the playa — flat base always present; the FLORA cracked-mud
          texture suspends in on top, revealed by the pooled light */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -40]}>
        <planeGeometry args={[600, 400]} />
        <meshStandardMaterial color="#101114" roughness={0.95} metalness={0} />
      </mesh>
      <Stars radius={220} depth={40} count={900} factor={3} saturation={0} fade speed={reducedMotion ? 0 : 0.4} />

      {/* everything that loads a texture or model suspends INSIDE the
          canvas — one boundary, so the GL context never remounts */}
      <Suspense fallback={null}>
        <Ground />
        <Horizon />
        <Them def={PORTALS.art} onEnter={onEnter} reducedMotion={reducedMotion} />
        <Constellation def={PORTALS.work} onEnter={onEnter} reducedMotion={reducedMotion} />
        <Fork def={PORTALS.thinking} onEnter={onEnter} reducedMotion={reducedMotion} />
        <Beacon def={PORTALS.contact} onEnter={onEnter} reducedMotion={reducedMotion} />
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
