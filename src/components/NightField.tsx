import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, type ThreeElements } from '@react-three/fiber'
import { Line, Stars, useCursor, useGLTF, useProgress, useTexture } from '@react-three/drei'
import { Bloom, EffectComposer, SMAA } from '@react-three/postprocessing'
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

type HoverLabel = (portal: PortalDef | null) => void

function usePortraitLayout() {
  return useThree(({ size }) => size.width / size.height < 0.75)
}

/* 0..1 eased hover value — every hover response uses this so nothing
   in the scene ever snaps */
function useEased01(hovered: boolean, k = 7) {
  const v = useRef(0)
  useFrame((_, delta) => {
    v.current += ((hovered ? 1 : 0) - v.current) * (1 - Math.exp(-k * delta))
  })
  return v
}

function EasedLight({
  hovered,
  on,
  off,
  ...props
}: { hovered: boolean; on: number; off: number } & Omit<ThreeElements['pointLight'], 'intensity' | 'ref'>) {
  const ref = useRef<THREE.PointLight>(null)
  const h = useEased01(hovered)
  useFrame(() => {
    if (ref.current) ref.current.intensity = off + (on - off) * h.current
  })
  return <pointLight ref={ref} intensity={off} {...props} />
}

function usePortalHover(portal?: PortalDef, onLabel?: HoverLabel): [boolean, { onPointerOver: (e: THREE.Event) => void; onPointerOut: () => void }] {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  return [
    hovered,
    {
      onPointerOver: (e: THREE.Event) => {
        ;(e as unknown as { stopPropagation: () => void }).stopPropagation()
        setHovered(true)
        if (portal && onLabel) onLabel(portal)
      },
      onPointerOut: () => {
        setHovered(false)
        if (onLabel) onLabel(null)
      },
    },
  ]
}

/* Real rocks (Hyper3D): two weathered variants shared by every stone */
function useRocks(): { geometry: THREE.BufferGeometry; material: THREE.Material }[] {
  const { scene } = useGLTF('/models/rocks.glb')
  return useMemo(() => {
    const out: { geometry: THREE.BufferGeometry; material: THREE.Material }[] = []
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        const old = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshStandardMaterial
        out.push({
          geometry: m.geometry,
          material: new THREE.MeshStandardMaterial({ map: old.map ?? null, roughness: 0.96, metalness: 0.04 }),
        })
      }
    })
    return out
  }, [scene])
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

function configureTiledTexture(tex: THREE.Texture) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
}

function configurePanoTexture(tex: THREE.Texture) {
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
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

/* A whole GLB with its own PBR materials (Rodin-generated heroes) */
function useGLBScene(url: string, { fogOff = false, tint = '#ffffff' } = {}): THREE.Group {
  const { scene } = useGLTF(url)
  return useMemo(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        /* rebuild the material from scratch: generated GLBs ship exotic
           material state (spec-gloss, metalness 1, odd alpha) that can
           render invisible under plain point lights */
        const old = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshStandardMaterial
        m.material = new THREE.MeshStandardMaterial({
          map: old.map ?? null,
          color: old.map ? new THREE.Color(tint) : (old.color ?? new THREE.Color(0x888888)),
          roughness: 0.7,
          metalness: 0.15,
          fog: !fogOff,
          side: THREE.DoubleSide,
        })
        m.frustumCulled = false
      }
    })
    return scene
  }, [scene, fogOff, tint])
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
  bodyColor = '#e2e2e2',
  bodyFog = true,
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
  bodyColor?: string
  bodyFog?: boolean
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
  const configured = useTexture(mapUrl, configureTiledTexture)

  const eased = useRef(glow)
  useFrame(({ clock }, delta) => {
    if (!mat.current) return
    const t = reducedMotion ? 0 : clock.elapsedTime
    // ease toward the hover target instead of snapping
    eased.current += (glow - eased.current) * (1 - Math.exp(-7 * delta))
    const pulse = eased.current + Math.sin(t * breathe + phase) * 0.12
    mat.current.color.copy(base).multiplyScalar(pulse)
  })

  return (
    <>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          map={configured}
          bumpMap={configured}
          bumpScale={0.6}
          color={bodyColor}
          roughness={0.85}
          metalness={0.25}
          fog={bodyFog}
          side={THREE.DoubleSide}
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
  const stripesMat = useRef<THREE.MeshBasicMaterial>(null)
  const h = useEased01(hovered)
  // concentric, non-intersecting ellipses per animal, derived from phase
  const RX = 7.5 - phase * 0.5
  const RZ = 5.5 - phase * 0.35
  const OMEGA = (2 * Math.PI) / (46 + phase * 5) // laps of ~46-62s; pack drifts apart and regroups

  useFrame(({ clock }) => {
    const g = walker.current
    if (!g) return
    const t = reducedMotion ? 0 : clock.elapsedTime
    const th = theta0 - t * OMEGA
    g.position.set(Math.cos(th) * RX, 0, Math.sin(th) * RZ)
    // face along the direction of travel (ellipse tangent)
    g.rotation.y = Math.atan2(Math.cos(th) * RZ, Math.sin(th) * RX)
    const w = 2.3 / Math.sqrt(scale) // stride cadence tuned so feet plant instead of skate
    for (const [name, pivot] of Object.entries(LEG_PIVOTS)) {
      const leg = legRefs.current[name]
      if (leg) {
        // asymmetric gait: quick swing, slow stance
        const a = t * w + LEG_PHASE[name] + phase
        leg.rotation.z = reducedMotion ? 0 : Math.sin(a) * 0.115 + Math.sin(2 * a + 0.6) * 0.022
      }
      void pivot
    }
    if (bodyGroup.current) {
      // body vaults highest at mid-stance (legs vertical), not at touchdown
      bodyGroup.current.position.y = reducedMotion ? 0 : Math.abs(Math.cos(t * w + phase)) * 0.05
      bodyGroup.current.rotation.x = reducedMotion ? 0 : Math.sin(t * w + phase + 0.9) * 0.02
    }
    if (stripesMat.current) {
      stripesMat.current.color.set('#ffdda8').multiplyScalar(1.35 + h.current * 0.65)
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
            glow={hovered ? 1.9 : 1.0}
            breathe={1.1}
            phase={phase}
            reducedMotion={reducedMotion}
            mapUrl="/textures/steel-tile.webp"
          />
        )}
        {stripes && (
          <mesh geometry={stripes}>
            <meshBasicMaterial ref={stripesMat} color={new THREE.Color('#ffdda8').multiplyScalar(1.35)} toneMapped={false} />
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
                glow={hovered ? 1.7 : 0.9}
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

function Them({ def, onEnter, reducedMotion, onLabel }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean; onLabel: HoverLabel }) {
  const [hovered, handlers] = usePortalHover(def, onLabel)
  const parts = useGLBGeometries('/models/them.glb')
  const portrait = usePortraitLayout()

  return (
    <group
      position={portrait ? [10, 0, -50] : [27, 0, -46]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      <Thylacine parts={parts} hovered={hovered} reducedMotion={reducedMotion} scale={1.1} theta0={0} phase={0} />
      <Thylacine parts={parts} hovered={hovered} reducedMotion={reducedMotion} scale={0.95} theta0={1.7} phase={1.7} />
      <Thylacine parts={parts} hovered={hovered} reducedMotion={reducedMotion} scale={0.8} theta0={3.5} phase={3.1} />
      <LightPool position={[0, 0.03, 0]} scale={12} color="#ffce8a" opacity={0.10} />
      {/* invisible hit volume covering the loop the pack walks; grows while
          hovered so the camera glide can't slide it out from under the
          cursor between press and release */}
      <mesh position={[0, 3, 0]} scale={hovered ? 1.5 : 1} visible={false}>
        <boxGeometry args={[19, 7, 13]} />
      </mesh>
      <EasedLight hovered={hovered} on={65} off={45} position={[0, 1.6, 0]} color="#ffce8a" distance={16} decay={2} />
    </group>
  )
}

/* Work — a real radio telescope (Hyper3D-generated, PBR): weathered
   white dish with panel segments on an alt-az pedestal, tilted at the
   sky and slowly tracking something across it. Listening at production
   scale. */
function Constellation({ def, onEnter, reducedMotion, onLabel }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean; onLabel: HoverLabel }) {
  const [hovered, handlers] = usePortalHover(def, onLabel)
  const portrait = usePortraitLayout()
  const telescope = useGLBScene(portrait ? '/models/dish.glb' : '/models/telescope.glb?v=2', { fogOff: true, tint: '#7e848c' })
  const azimuth = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!azimuth.current || reducedMotion) return
    // one slow sweep and back across the sky, like a long observation;
    // the whole alt-az assembly turns on its pedestal, the way they do
    azimuth.current.rotation.y = Math.sin(clock.elapsedTime * 0.045) * 0.55
  })

  return (
    <group
      position={portrait ? [-18, 0, -94] : [-52, 0, -100]}
      rotation-y={0.35}
      scale={portrait ? 2.45 : 2.2}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      <group ref={azimuth}>
        <primitive object={telescope} />
      </group>
      {/* hit volume covering the full dish sweep so hover stays stable;
          hover hysteresis keeps it under the cursor through the camera pan */}
      <mesh position={[0, 5, 0]} scale={hovered ? 1.5 : 1} visible={false}>
        <boxGeometry args={[10.5, 10.5, 10.5]} />
      </mesh>
      {/* night lighting: a cool key from behind-left rims the dish edge
          while the bowl stays in soft shadow; a weak fill keeps the
          pedestal legible. No frontal floodlight — that flattens the
          bowl into a white disc. */}
      <EasedLight hovered={hovered} on={700} off={430} position={[-7, 9, -6]} color="#b8c4d8" distance={70} decay={2} />
      <EasedLight hovered={hovered} on={300} off={170} position={[0, 1.2, -2]} color="#8fa8d8" distance={50} decay={2} />
    </group>
  )
}

/* Thinking — a weathered wooden trail signpost (Hyper3D-generated,
   PBR): four finger boards pointing different ways, stones at the base,
   lantern-lit at the fork where the marker-stone paths split */
function Fork({ def, onEnter, onLabel }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; onLabel: HoverLabel }) {
  const [hovered, handlers] = usePortalHover(def, onLabel)
  const portrait = usePortraitLayout()
  const signpost = useGLBScene(portrait ? '/models/signpost.glb' : '/models/signpost-hd.glb')
  const rocks = useRocks()

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

  return (
    <group
      position={portrait ? [4.2, 0, 1] : [6.5, 0, 4]}
      rotation-y={0.45}
      scale={portrait ? 0.38 : 0.42}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      <primitive object={signpost} />
      {markers.map((m, i) => (
        <mesh
          key={i}
          geometry={rocks[i % rocks.length].geometry}
          material={rocks[i % rocks.length].material}
          position={[m.x, 0, m.z]}
          rotation-y={i * 1.7}
          scale={m.s * 1.3}
        />
      ))}
      {/* Suzanne on a plinth beside the fork, thinking it over — garnish,
          so she streams in behind her own Suspense instead of holding up
          the field's first frame */}
      <Suspense fallback={null}>
        <ForkSuzanne />
      </Suspense>
      <LightPool position={[0, 0.03, 0]} scale={5.5} color="#d9cba4" opacity={0.08} />
      <mesh position={[0, 2.4, 0]} scale={hovered ? 1.5 : 1} visible={false}>
        <boxGeometry args={[6.5, 5.4, 3.5]} />
      </mesh>
      <EasedLight hovered={hovered} on={20} off={9} position={[1.6, 3.4, 1.8]} color="#d8c294" distance={9} decay={2} />
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
  const grp = useRef<THREE.Group>(null)
  useFrame(({ clock }, delta) => {
    const t = reducedMotion ? 8 : clock.elapsedTime
    // offset each plane's clock so the two sheets never flicker in lockstep
    mats.current.forEach((m, i) => {
      if (m) m.uniforms.uTime.value = t + i * 4.7
    })
    if (grp.current) {
      grp.current.scale.setScalar(THREE.MathUtils.damp(grp.current.scale.x, hovered ? 1.15 : 1, 6, delta))
    }
  })
  const uniforms = useMemo(() => [{ uTime: { value: 0 } }, { uTime: { value: 0 } }], [])
  return (
    <group ref={grp} position={[0, 0.28, 0]}>
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

function ForkSuzanne() {
  const suzParts = useGLBGeometries('/models/suzanne.glb')
  const suzanne = Object.entries(suzParts).find(([k]) => k.includes('suzanne'))?.[1]
  const plinth = Object.entries(suzParts).find(([k]) => k.includes('plinth'))?.[1]
  return (
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
  )
}

function CampArtifacts() {
  const teapot = useGLBGeometry('/models/teapot.glb')
  const bike = useGLBScene('/models/bike.glb')

  return (
    <>
      {/* the Utah teapot, waiting by the fire for whoever shows up */}
      <mesh geometry={teapot} position={[2.3, 0, 1.1]} rotation-y={-2.1} scale={0.9}>
        <meshStandardMaterial color="#7a7168" roughness={0.6} metalness={0.35} />
      </mesh>
      {/* somebody's dusty cruiser, leaned where they left it */}
      <primitive object={bike} position={[3.1, 0, -1.6]} rotation-y={0.85} rotation-z={0.06} scale={0.55} />
    </>
  )
}

/* Contact — a real campfire: a teepee of wooden logs (FLORA wood, lit
   by its own flame), a ring of playa stones, embers rising */
function Beacon({ def, onEnter, reducedMotion, onLabel }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean; onLabel: HoverLabel }) {
  const [hovered, handlers] = usePortalHover(def, onLabel)
  const portrait = usePortraitLayout()
  const light = useRef<THREE.PointLight>(null)
  const core = useRef<THREE.Mesh>(null)
  const hEased = useEased01(hovered)
  const wood = useTexture('/textures/wood-tile.webp')
  const rocks = useRocks()

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.elapsedTime
    // three incommensurate frequencies + an amplitude-modulated term for occasional deep dips
    const flicker = 1 + Math.sin(t * 7.3) * 0.06 + Math.sin(t * 11.9 + 1.7) * 0.05 + Math.sin(t * 0.7) * Math.sin(t * 23.1) * 0.045
    if (light.current) light.current.intensity = (60 + hEased.current * 40) * flicker
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
      position={portrait ? [-4.5, 0, 5] : [-8, 0, 9]}
      scale={portrait ? 0.82 : 1}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      {!portrait && (
        <Suspense fallback={null}>
          <CampArtifacts />
        </Suspense>
      )}
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
        <mesh
          key={i}
          geometry={rocks[i % rocks.length].geometry}
          material={rocks[i % rocks.length].material}
          position={[s.pos.x, 0, s.pos.z]}
          rotation-y={s.rot}
          scale={[s.scale * 1.8, s.scale * 1.4 * s.squash, s.scale * 1.6]}
        />
      ))}
      {/* embers glowing low in the pit */}
      <mesh ref={core} position={[0, 0.18, 0]} scale={[1.2, 0.5, 1.2]}>
        <sphereGeometry args={[0.32, 10, 10]} />
        <meshBasicMaterial color={new THREE.Color('#ff7b2d').multiplyScalar(2.8)} toneMapped={false} />
      </mesh>
      {/* the flames themselves */}
      <Flame hovered={hovered} reducedMotion={reducedMotion} />
      <LightPool position={[0, 0.025, 0]} scale={12} color="#ff9d4d" opacity={0.22} />
      <Embers hovered={hovered} reducedMotion={reducedMotion} />
      {/* tight hit volume so it can't shadow the garden behind it —
          only grows once already hovered, so the garden stays reachable */}
      <mesh position={[0, 1, 0]} scale={hovered ? 1.5 : 1} visible={false}>
        <sphereGeometry args={[2.2, 8, 8]} />
      </mesh>
      <pointLight ref={light} position={[0, 0.9, 0]} color="#ff9d4d" intensity={60} distance={16} decay={2} />
    </group>
  )
}

function Embers({ hovered, reducedMotion }: { hovered: boolean; reducedMotion: boolean }) {
  const inst = useRef<THREE.InstancedMesh>(null)
  const N = 5
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const phases = useMemo(() => Array.from({ length: N }, (_, i) => {
    const s = Math.sin(i * 91.7 + 47.3) * 43758.5453
    return s - Math.floor(s)
  }), [])
  useFrame(({ clock }) => {
    const mesh = inst.current
    if (!mesh) return
    const t = reducedMotion ? 0 : clock.elapsedTime
    for (let i = 0; i < N; i++) {
      const cycle = (t * (0.38 + phases[i] * 0.3) + phases[i]) % 1
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

/* One new stem, seeded fresh every ~18s: grows from the ground, holds,
   then fades so the next cycle can relocate cleanly. Literalizes
   "250+ notes, growing" as an actual repeating growth animation. */
const SPROUT_CYCLE = 18
function sproutRnd(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}
function Sprout({ reducedMotion }: { reducedMotion: boolean }) {
  const outer = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const lineMat = useRef<(THREE.Material & { opacity: number }) | null>(null)
  const tipMat = useRef<THREE.MeshBasicMaterial>(null)
  const kRef = useRef(-1)
  const [cycle, setCycle] = useState(() => ({
    x: Math.cos(0 * 2.399) * (0.7 + sproutRnd(0, 31) * 2.6),
    z: Math.sin(0 * 2.399) * (0.7 + sproutRnd(0, 32) * 2.6) * 0.7,
    h: 0.7 + sproutRnd(0, 33) * 1.2,
  }))

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.elapsedTime
    const k = Math.floor(t / SPROUT_CYCLE)
    const p = (t % SPROUT_CYCLE) / SPROUT_CYCLE
    if (k !== kRef.current) {
      kRef.current = k
      setCycle({
        x: Math.cos(k * 2.399) * (0.7 + sproutRnd(k, 31) * 2.6),
        z: Math.sin(k * 2.399) * (0.7 + sproutRnd(k, 32) * 2.6) * 0.7,
        h: 0.7 + sproutRnd(k, 33) * 1.2,
      })
    }
    let growth = 1
    let opacity = 1
    if (p < 0.12) {
      const u = p / 0.12
      growth = 1 - Math.pow(1 - u, 3)
    } else if (p >= 0.92) {
      const u = (p - 0.92) / 0.08
      opacity = 1 - u
    }
    if (outer.current) outer.current.position.set(cycle.x, 0, cycle.z)
    if (inner.current) inner.current.scale.y = Math.max(growth, 0.0001)
    if (lineMat.current) lineMat.current.opacity = opacity
    if (tipMat.current) tipMat.current.opacity = opacity
  })

  if (reducedMotion) return null

  return (
    <group ref={outer} position={[cycle.x, 0, cycle.z]}>
      <group ref={inner}>
        <Line
          ref={(el: unknown) => {
            const line = el as { material?: THREE.Material & { opacity: number } } | null
            lineMat.current = line?.material ?? null
          }}
          points={[
            [0, 0, 0],
            [0, cycle.h, 0],
          ]}
          lineWidth={1}
          color={new THREE.Color('#8a9a80').multiplyScalar(1.2)}
          toneMapped={false}
          transparent
        />
        <mesh position={[0, cycle.h, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            ref={tipMat}
            color={new THREE.Color('#e2e8d8').multiplyScalar(1.6)}
            toneMapped={false}
            transparent
          />
        </mesh>
      </group>
    </group>
  )
}

/* The garden — an actual planted bed at night: curved stems with leaf
   blades, glowing bud tips, and a few tall alliums holding orbs of
   light over the rest. The plant-glyph language of garden.n3wth.com. */
function GardenPatch({ def, onEnter, reducedMotion, onLabel }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; reducedMotion: boolean; onLabel: HoverLabel }) {
  const [hovered, handlers] = usePortalHover(def, onLabel)
  const portrait = usePortraitLayout()
  const tips = useRef<THREE.InstancedMesh>(null)
  const orbs = useRef<THREE.InstancedMesh>(null)
  const bed = useRef<THREE.Group>(null)
  const stemsMat = useRef<THREE.LineBasicMaterial>(null)
  const tipsMat = useRef<THREE.MeshBasicMaterial>(null)
  const orbsMat = useRef<THREE.MeshBasicMaterial>(null)
  const h = useEased01(hovered)
  const dummy = useMemo(() => new THREE.Object3D(), [])

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
      const h = 0.4 + Math.pow(rnd(i, 2), 1.6) * 1.9
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
    // wind over the whole bed: gusts lean everything from the ground up,
    // two incommensurate periods so it swooshes instead of ticking
    if (bed.current) {
      bed.current.rotation.z = Math.sin(t * 0.55) * 0.014 + Math.sin(t * 1.31 + 2.1) * 0.011
      bed.current.rotation.x = Math.sin(t * 0.43 + 1.2) * 0.008
    }
    if (stemsMat.current) stemsMat.current.color.set('#78876f').multiplyScalar(1 + h.current * 0.8)
    if (tipsMat.current) tipsMat.current.color.set('#e2e8d8').multiplyScalar(1.3 + h.current * 0.9)
    if (orbsMat.current) orbsMat.current.color.set('#efeee6').multiplyScalar(1.5 + h.current * 0.9)
    if (tips.current) {
      for (let i = 0; i < plants.length; i++) {
        const p = plants[i]
        const sway = reducedMotion ? 0 : Math.sin(t * (1.15 + (i % 7) * 0.09) + i * 1.9) * 0.05
        dummy.position.set(p.x + p.lean + sway, p.h, p.z)
        dummy.scale.setScalar((0.045 + (i % 4) * 0.014) * (1 + h.current * 0.5))
        dummy.updateMatrix()
        tips.current.setMatrixAt(i, dummy.matrix)
      }
      tips.current.instanceMatrix.needsUpdate = true
    }
    if (orbs.current) {
      for (let i = 0; i < alliums.length; i++) {
        const p = alliums[i]
        const bob = reducedMotion ? 0 : Math.sin(t * (0.68 + (i % 3) * 0.11) + i * 2.6) * 0.04
        dummy.position.set(p.x, p.h + 0.16 + bob, p.z)
        dummy.scale.setScalar((0.16 + (i % 3) * 0.035) * (1 + h.current * 0.35))
        dummy.updateMatrix()
        orbs.current.setMatrixAt(i, dummy.matrix)
      }
      orbs.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group
      position={portrait ? [-7, 0, -19] : [-6, 0, -16]}
      scale={portrait ? 0.88 : 1}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      <group ref={bed}>
        {/* stems + leaves, one draw call */}
        <lineSegments geometry={stemGeo}>
          <lineBasicMaterial ref={stemsMat} color={new THREE.Color('#78876f')} toneMapped={false} />
        </lineSegments>
        {/* glowing bud tips */}
        <instancedMesh ref={tips} args={[undefined, undefined, plants.length]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial ref={tipsMat} color={new THREE.Color('#e2e8d8').multiplyScalar(1.3)} toneMapped={false} />
        </instancedMesh>
        {/* allium orbs above the bed */}
        <instancedMesh ref={orbs} args={[undefined, undefined, alliums.length]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            ref={orbsMat}
            color={new THREE.Color('#efeee6').multiplyScalar(1.5)}
            wireframe
            toneMapped={false}
          />
        </instancedMesh>
        {/* one new stem growing every ~18s — makes "growing" literal */}
        <Sprout reducedMotion={reducedMotion} />
      </group>
      <LightPool position={[0, 0.03, 0]} scale={8} color="#b9c9a8" opacity={0.07} />
      <mesh position={[0, 1.9, 0]} scale={hovered ? 1.5 : 1} visible={false}>
        <boxGeometry args={[8.5, 4.6, 6.5]} />
      </mesh>
      <EasedLight hovered={hovered} on={22} off={14} position={[0, 1.2, 0]} color="#b9c9a8" distance={14} decay={2} />
    </group>
  )
}

/* Pink Triangle on the far ridge — the skyline */
function PinkTriangle({ def, onEnter, onLabel }: { def: PortalDef; onEnter: NightFieldProps['onEnter']; onLabel: HoverLabel }) {
  const [hovered, handlers] = usePortalHover(def, onLabel)
  const portrait = usePortraitLayout()
  const lineMat = useRef<{ color: THREE.Color } | null>(null)
  const fillMat = useRef<THREE.MeshBasicMaterial>(null)
  const h = useEased01(hovered)
  useFrame(() => {
    if (lineMat.current) lineMat.current.color.set('#ff5fa2').multiplyScalar(1.7 + h.current * 0.7)
    if (fillMat.current) fillMat.current.opacity = 0.09 + h.current * 0.05
  })
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
      position={portrait ? [20, 10, -122] : [82, 9, -128]}
      scale={portrait ? 1.35 : 1.7}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        onEnter(def.href, def.external)
      }}
    >
      <Line
        ref={(el: unknown) => {
          const line = el as { material?: { color: THREE.Color } } | null
          if (line?.material) lineMat.current = line.material
        }}
        points={tri}
        color={new THREE.Color('#ff5fa2').multiplyScalar(1.7)}
        lineWidth={1.5}
        toneMapped={false}
      />
      {/* faint pink wash inside the outline */}
      <mesh position={[0, 0, -0.05]}>
        <shapeGeometry args={[fill]} />
        <meshBasicMaterial ref={fillMat} color="#ff5fa2" transparent opacity={0.09} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 2.2, 0]} scale={hovered ? 1.5 : 1} visible={false}>
        <boxGeometry args={[8, 6, 3]} />
      </mesh>
    </group>
  )
}

/* The playa itself — real terrain (Blender): near-flat where you stand,
   swelling into dust drifts and berms toward the edges, flat pads under
   every structure. FLORA cracked-mud tiles across it, revealed by the
   pooled light. */
function Ground() {
  const configured = useTexture('/textures/playa-tile.webp', configureTiledTexture)
  const terrain = useGLBGeometry('/models/terrain.glb')
  return (
    <mesh geometry={terrain}>
      <meshStandardMaterial
        map={configured}
        bumpMap={configured}
        bumpScale={0.75}
        color="#8e9194"
        roughness={0.96}
        metalness={0}
      />
    </mesh>
  )
}

/* Ambient sky base: the World Labs Marble 360 pano of this exact
   scene, multiplied way down — it gives every azimuth a coherent sky
   tone and far-off camp lights, while the crisp star/ridge layers
   above carry the detail */
function PanoSky() {
  const configured = useTexture('/textures/marble-pano.webp', configurePanoTexture)
  return (
    <mesh position={[0, -4, 0]} rotation-y={2.2} renderOrder={-1}>
      <sphereGeometry args={[430, 48, 32]} />
      <meshBasicMaterial
        map={configured}
        color="#565c66"
        side={THREE.BackSide}
        fog={false}
        toneMapped={false}
        depthWrite={false}
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
    <mesh position={[8, 20, -150]}>
      <planeGeometry args={[420, 224]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} fog={false} toneMapped={false} />
    </mesh>
  )
}

/* The Milky Way (FLORA astrophotography) wrapped on a far cylinder —
   additive, so its black sky dissolves into ours and only the stars
   and the galactic band remain */
function MilkyWay() {
  const tex = useTexture('/textures/sky-pano.webp')
  return (
    // bottom rim dropped below the ground plane so no hard seam arcs across the sky
    <mesh position={[0, 70, 0]} rotation-y={0.4}>
      <cylinderGeometry args={[210, 210, 180, 48, 1, true]} />
      <meshBasicMaterial
        map={tex}
        side={THREE.BackSide}
        transparent
        opacity={0.48}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fog={false}
        toneMapped={false}
      />
    </mesh>
  )
}

/* A shooting star every so often: one bright streak, in and gone */
function Meteors({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  const st = useRef({ next: 6, active: false, t0: 0, from: new THREE.Vector3(), dir: new THREE.Vector3(), rot: 0 })
  useFrame(({ clock }) => {
    const m = ref.current
    if (!m || reducedMotion) return
    const s = st.current
    const t = clock.elapsedTime
    if (!s.active && t > s.next) {
      s.active = true
      s.t0 = t
      const x = -90 + Math.random() * 180
      const y = 55 + Math.random() * 35
      s.from.set(x, y, -175)
      s.dir.set(0.5 + Math.random() * 0.5, -(0.25 + Math.random() * 0.2), 0).normalize()
      if (Math.random() > 0.5) s.dir.x *= -1
      s.rot = Math.atan2(s.dir.y, s.dir.x)
    }
    if (s.active) {
      const p = (t - s.t0) / 0.8
      if (p >= 1) {
        s.active = false
        s.next = t + 7 + Math.random() * 13
        m.visible = false
      } else {
        m.visible = true
        m.position.copy(s.from).addScaledVector(s.dir, p * 46)
        m.rotation.z = s.rot
        ;(m.material as THREE.MeshBasicMaterial).opacity = Math.sin(p * Math.PI) * 0.85
      }
    }
  })
  return (
    <mesh ref={ref} visible={false}>
      <planeGeometry args={[8, 0.07]} />
      <meshBasicMaterial
        color={new THREE.Color('#cfe0ff').multiplyScalar(3)}
        transparent
        opacity={0}
        toneMapped={false}
        fog={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/* A low, cool pool follows the viewer across the playa. It is deliberately
   weaker than every artwork's own light: the field is discovered, never
   floodlit. */
function SurveyLight({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  const hit = useMemo(() => new THREE.Vector3(), [])
  const target = useRef(new THREE.Vector3(0, 0.04, -12))

  useFrame(({ camera, clock, pointer, raycaster }, delta) => {
    if (!reducedMotion) {
      raycaster.setFromCamera(pointer, camera)
      const intersection = raycaster.ray.intersectPlane(plane, hit)
      if (intersection) {
        target.current.set(
          THREE.MathUtils.clamp(intersection.x, -42, 42),
          0.04,
          THREE.MathUtils.clamp(intersection.z, -72, 13)
        )
      }
    }

    const k = 1 - Math.exp(-3.2 * delta)
    group.current?.position.lerp(target.current, k)
    if (light.current) {
      light.current.intensity = reducedMotion
        ? 4
        : 5.5 + Math.sin(clock.elapsedTime * 0.43) * 0.35
    }
  })

  return (
    <group ref={group} position={[0, 0.04, -12]}>
      <mesh rotation-x={-Math.PI / 2} scale={15} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={poolTexture()}
          color="#a9bdd7"
          transparent
          opacity={0.035}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <pointLight
        ref={light}
        position={[0, 4.5, 0]}
        color="#9fb6d1"
        intensity={4}
        distance={18}
        decay={2}
      />
    </group>
  )
}

/* One draw call of near-ground dust gives the camera real parallax. The
   points sit below the stars and disappear into the same scene fog. */
function PlayaDust({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const out = new Float32Array(150 * 3)
    const rnd = (i: number, salt: number) => {
      const n = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
      return n - Math.floor(n)
    }
    for (let i = 0; i < 150; i++) {
      out[i * 3] = (rnd(i, 1) - 0.5) * 150
      out[i * 3 + 1] = 0.2 + Math.pow(rnd(i, 2), 2) * 4.2
      out[i * 3 + 2] = 14 - rnd(i, 3) * 122
    }
    return out
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return
    ref.current.position.x = Math.sin(clock.elapsedTime * 0.035) * 1.2
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.018) * 0.003
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#c8c0b2"
        size={0.075}
        sizeAttenuation
        transparent
        opacity={0.32}
        depthWrite={false}
        fog
      />
    </points>
  )
}

const CAMERA_FOCUS: Record<string, { cameraX: number; lookX: number; lookY: number; lookZ: number }> = {
  work: { cameraX: -1.5, lookX: -5.8, lookY: 4.9, lookZ: -34 },
  art: { cameraX: 1.4, lookX: 4.8, lookY: 4.1, lookZ: -31 },
  thinking: { cameraX: 1.1, lookX: 2.8, lookY: 3.5, lookZ: -25 },
  contact: { cameraX: -1.2, lookX: -2.8, lookY: 3.2, lookZ: -24 },
  garden: { cameraX: -0.7, lookX: -1.7, lookY: 3.8, lookZ: -28 },
  triangle: { cameraX: 1.8, lookX: 6.4, lookY: 5.2, lookZ: -36 },
}

function Rig({ active, ready, reducedMotion }: { active: PortalDef | null; ready: boolean; reducedMotion: boolean }) {
  const lookAt = useRef(new THREE.Vector3(0, 4.5, -30))
  const targetLook = useRef(new THREE.Vector3(0, 4.5, -30))
  const introStarted = useRef<number | null>(null)

  useFrame(({ camera, pointer, clock, size }, delta) => {
    const aspect = size.width / size.height
    const baseZ = aspect < 0.75 ? 38 : aspect < 1.15 ? 29 : 22
    if (ready && introStarted.current === null) {
      introStarted.current = clock.elapsedTime
      camera.position.y = aspect < 0.75 ? 2.4 : 2.15
      camera.position.z = baseZ + (aspect < 0.75 ? 8 : 11)
    }

    if (reducedMotion) {
      camera.position.set(0, 3.2, baseZ)
      camera.lookAt(aspect < 0.75 ? 2.2 : 0, 4.5, -30)
      return
    }

    const t = clock.elapsedTime
    const introElapsed = introStarted.current === null ? 0 : t - introStarted.current
    const intro = ready ? THREE.MathUtils.smoothstep(introElapsed, 0, 2.8) : 0
    const introOffset = (1 - intro) * (aspect < 0.75 ? 8 : 11)
    const focus = active ? CAMERA_FOCUS[active.id] : undefined
    const pointerWeight = active ? 0.45 : 1
    // two incommensurate drift periods (~78s / ~217s) plus a faint vertical breath.
    // Pointer contributes a subtle parallax nudge, not a pan — the ambient
    // drift carries the motion; the cursor should barely tip the balance.
    const targetX = pointer.x * 1.1 * pointerWeight + (focus?.cameraX ?? 0) + Math.sin(t * 0.08) * 0.45 + Math.sin(t * 0.029 + 1.7) * 0.3
    const targetY = 3.2 + pointer.y * 0.45 * pointerWeight - (1 - intro) * 0.75 + Math.sin(t * 0.047 + 0.8) * 0.12
    const targetZ = baseZ + introOffset
    const k = 1 - Math.exp(-1.6 * delta)
    camera.position.x += (targetX - camera.position.x) * k
    camera.position.y += (targetY - camera.position.y) * k
    camera.position.z += (targetZ - camera.position.z) * k
    // gaze drifts on periods incommensurate with the position drift, so the
    // viewpoint breathes instead of dollying on a rail
    targetLook.current.set(
      (focus?.lookX ?? (aspect < 0.75 ? 2.2 : 0)) + Math.sin(t * 0.021 + 3.1) * 0.8,
      (focus?.lookY ?? 4.5) + Math.sin(t * 0.037 + 2.2) * 0.25,
      focus?.lookZ ?? -30
    )
    lookAt.current.lerp(targetLook.current, 1 - Math.exp(-2.1 * delta))
    camera.lookAt(lookAt.current)

    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFov = (aspect < 0.75 ? 54 : 48) + (1 - intro) * 4
      const nextFov = THREE.MathUtils.damp(camera.fov, targetFov, 3.5, delta)
      if (Math.abs(nextFov - camera.fov) > 0.001) {
        camera.fov = nextFov
        camera.updateProjectionMatrix()
      }
    }
  })
  return null
}

/* Portals and terrain preload; garnish (suzanne, teapot, bike — ~2.5MB)
   deliberately does not. Those stream in behind nested Suspense after
   the field's first frame instead of gating it. */
useGLTF.preload('/models/them.glb')
useGLTF.preload('/models/terrain.glb')
useGLTF.preload('/models/rocks.glb')
const portraitAtLoad = typeof window !== 'undefined' && window.matchMedia('(max-aspect-ratio: 3/4)').matches
if (portraitAtLoad) {
  useGLTF.preload('/models/dish.glb')
  useGLTF.preload('/models/signpost.glb')
} else {
  useGLTF.preload('/models/telescope.glb?v=2')
  useGLTF.preload('/models/signpost-hd.glb')
}
useTexture.preload('/textures/playa-tile.webp')
useTexture.preload('/textures/horizon.webp')
useTexture.preload('/textures/steel-tile.webp')
useTexture.preload('/textures/wood-tile.webp')
useTexture.preload('/textures/marble-pano.webp')

const PORTALS: Record<string, PortalDef> = {
  art: { id: 'art', label: 'Art', sub: 'Light installations', href: '/art' },
  work: { id: 'work', label: 'Work', sub: 'A decade of AI in production', href: '/work' },
  thinking: { id: 'thinking', label: 'Thinking', sub: 'Trade-offs, not clean answers', href: '/thinking' },
  contact: { id: 'contact', label: "Let's talk", sub: 'oliver@newth.ai', href: '/contact' },
  garden: { id: 'garden', label: 'The garden', sub: '250+ notes, growing', href: 'https://garden.n3wth.com', external: true },
  triangle: { id: 'triangle', label: 'Art', sub: 'Pink Triangle, Twin Peaks', href: '/art' },
}

function SceneReady({ onReady }: { onReady: () => void }) {
  const sent = useRef(false)
  useFrame(() => {
    if (sent.current) return
    sent.current = true
    onReady()
  })
  return null
}

function WorldInterface({
  active,
  progress,
  ready,
}: {
  active: PortalDef | null
  progress: number
  ready: boolean
}) {
  const shownProgress = Math.max(4, Math.min(100, Math.round(progress)))

  return (
    <>
      <div className="night-field-loader" data-ready={ready ? 'true' : 'false'} aria-hidden={ready}>
        <img src="/images/hero-playa.webp" alt="" className="night-field-loader-image" />
        <div className="night-field-loader-tint" />
        <div className="night-field-loader-status" role="status" aria-label="Loading the night field">
          <span>Night field</span>
          <span>{shownProgress}%</span>
          <span className="night-field-loader-track" aria-hidden>
            <span style={{ transform: `scaleX(${shownProgress / 100})` }} />
          </span>
        </div>
      </div>

      {/* Identity sits above the loader so the visitor learns whose site
          this is on first paint, not after the field finishes loading. */}
      <div className="world-identity-layer">
        <header className="world-identity">
          <p className="world-identity-kicker">n3wth / field at night</p>
          <h1>Oliver Newth</h1>
          <p>AI product lead at Google · ex-Covariant, Meta, Microsoft · light artist</p>
        </header>
      </div>

      <div className="world-interface" data-ready={ready ? 'true' : 'false'}>
        <div className="world-atlas">
          <div className="world-atlas-copy" aria-live="polite">
            <p>{active?.label ?? 'Explore the field'}</p>
            <span>{active?.sub ?? 'Each light opens a chapter.'}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default function NightField({ onEnter, reducedMotion }: NightFieldProps) {
  const [active, setActive] = useState<PortalDef | null>(null)
  const [ready, setReady] = useState(false)
  const { progress } = useProgress()
  const navigationTimer = useRef<number | null>(null)
  const pendingHref = useRef<string | null>(null)

  useEffect(() => () => {
    if (navigationTimer.current !== null) window.clearTimeout(navigationTimer.current)
  }, [])

  const handleFocus = useCallback<HoverLabel>((portal) => {
    if (portal || navigationTimer.current === null) setActive(portal)
  }, [])

  const focusThenEnter = useCallback<NightFieldProps['onEnter']>((href, external) => {
    const portal = Object.values(PORTALS).find((item) => item.href === href) ?? null
    setActive(portal)
    if (reducedMotion) {
      onEnter(href, external)
      return
    }
    if (navigationTimer.current !== null) {
      window.clearTimeout(navigationTimer.current)
      // An impatient repeat click on the same portal commits immediately —
      // re-arming the timer would postpone navigation on every click,
      // reading as "the click didn't work".
      if (pendingHref.current === href) {
        navigationTimer.current = null
        pendingHref.current = null
        onEnter(href, external)
        return
      }
    }
    pendingHref.current = href
    navigationTimer.current = window.setTimeout(() => {
      navigationTimer.current = null
      pendingHref.current = null
      onEnter(href, external)
    }, 200)
  }, [onEnter, reducedMotion])

  return (
    <>
    <Canvas
      dpr={portraitAtLoad ? [1, 1.25] : [1, 1.5]}
      camera={{ position: [0, 3.2, 22], fov: 48 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      frameloop={reducedMotion ? 'demand' : 'always'}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#0e1113']} />
      <fog attach="fog" args={['#0e1113', 30, 145]} />
      <ambientLight intensity={0.05} />
      <hemisphereLight args={['#161c28', '#0a0908']} intensity={0.18} />
      {/* one consistent moon: cool, high, from the Milky Way side — it
          shades the terrain undulation so the ground reads as ground */}
      <directionalLight position={[40, 60, -25]} color="#a8b8d0" intensity={0.22} />
      {/* the far glow behind the ridge, barely */}
      <directionalLight position={[-6, 18, -120]} color="#8a7a68" intensity={0.14} />

      {/* flat base under the terrain so nothing shows through while the
          terrain mesh suspends in */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.55, -40]}>
        <planeGeometry args={[600, 400]} />
        <meshStandardMaterial color="#14161a" roughness={0.95} metalness={0} />
      </mesh>
      <Stars radius={220} depth={40} count={900} factor={3} saturation={0} fade speed={reducedMotion ? 0 : 0.4} />

      {/* The sky and terrain reveal first. Landmarks suspend separately,
          so a slow model never holds the entire field behind black. */}
      <Suspense fallback={null}>
        <Ground />
        <PanoSky />
        <Horizon />
        <MilkyWay />
        <SceneReady onReady={() => setReady(true)} />
      </Suspense>
      <Suspense fallback={null}>
        <Them def={PORTALS.art} onEnter={focusThenEnter} reducedMotion={reducedMotion} onLabel={handleFocus} />
      </Suspense>
      <Suspense fallback={null}>
        <Constellation def={PORTALS.work} onEnter={focusThenEnter} reducedMotion={reducedMotion} onLabel={handleFocus} />
      </Suspense>
      <Suspense fallback={null}>
        <Fork def={PORTALS.thinking} onEnter={focusThenEnter} onLabel={handleFocus} />
      </Suspense>
      <Suspense fallback={null}>
        <Beacon def={PORTALS.contact} onEnter={focusThenEnter} reducedMotion={reducedMotion} onLabel={handleFocus} />
      </Suspense>
      <Suspense fallback={null}>
        <GardenPatch def={PORTALS.garden} onEnter={focusThenEnter} reducedMotion={reducedMotion} onLabel={handleFocus} />
      </Suspense>
      <Suspense fallback={null}>
        <PinkTriangle def={PORTALS.triangle} onEnter={focusThenEnter} onLabel={handleFocus} />
      </Suspense>

      <Meteors reducedMotion={reducedMotion} />
      <PlayaDust reducedMotion={reducedMotion} />
      <SurveyLight reducedMotion={reducedMotion} />
      <Rig active={active} ready={ready} reducedMotion={reducedMotion} />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.65} luminanceThreshold={1.15} mipmapBlur radius={0.75} />
        <SMAA />
      </EffectComposer>
    </Canvas>
    <WorldInterface
      active={active}
      progress={progress}
      ready={ready}
    />
    </>
  )
}
