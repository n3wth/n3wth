import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { gsap, useGSAP } from '../../../../lib/scroll'
import { countTriangles, frameloopFor, poolTexture, ramp, rebuildMaterials, useNear } from './support'

/**
 * Set piece two: the Blender-to-browser pipeline, performed by the
 * homepage's own bike (/models/bike.glb — the dusty cruiser leaned by
 * the campfire). One pinned scroll carries it through four states:
 * edges, clay, textured, night-lit. All three body variants are clones
 * of one normalized scene inside one spinning group; scroll drives a
 * plain progress object and useFrame turns that into crossfade weights,
 * so nothing on the scroll path touches React state.
 */

const STAGES = [
  {
    name: 'geometry',
    text:
      'Blender first. Lay the scene out at real scale and apply every transform before export. The night field skipped that once; the parked models orbited a ghost point in empty space until location was zeroed.',
  },
  {
    name: 'export',
    text:
      'Export a GLB. Lights and modifiers stay behind, and materials barely make the trip; what survives is geometry, UVs, and whatever the Principled BSDF could describe.',
  },
  {
    name: 'materials',
    text:
      'Rebuild materials at load. Generated meshes ship exotic state; Rodin sets metalness to 1, which renders pure black under point lights. The homepage fix is two floats: metalness 0.15, roughness 0.7.',
  },
  {
    name: 'light',
    text:
      'Then light it like a place, not a product shot. Point lights, a pool on the ground, no HDRI. Somebody’s dusty cruiser, leaned where they left it.',
  },
]

const BIKE_BYTES = 1_216_456 // real size of /public/models/bike.glb on disk

interface Prog {
  p: number
}

// The reduced-motion pose: textured, lit, no pin. A fixed object (never
// tweened) so a mid-session reduced-motion flip can't strand the bike
// half-crossfaded at whatever the live progress happened to be.
const REDUCED_POSE: Prog = { p: 0.72 }

function BikeStates({
  prog,
  reduced,
  onStats,
}: {
  prog: Prog
  reduced: boolean
  onStats: (tris: number) => void
}) {
  const { scene } = useGLTF('/models/bike.glb')
  const spinRef = useRef<THREE.Group>(null)
  const wireRef = useRef<THREE.Group>(null)
  const clayRef = useRef<THREE.Group>(null)
  const texRef = useRef<THREE.Group>(null)
  const keyRef = useRef<THREE.PointLight>(null)
  const warmRef = useRef<THREE.PointLight>(null)
  const poolRef = useRef<THREE.MeshBasicMaterial>(null)

  const built = useMemo(() => {
    const normalize = (root: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(root)
      const size = new THREE.Vector3()
      const center = new THREE.Vector3()
      box.getSize(size)
      box.getCenter(center)
      const scale = 2.6 / Math.max(size.x, size.y, size.z, 0.001)
      root.children.forEach((c) => c.position.sub(center))
      root.scale.setScalar(scale)
    }

    // Everything created here (not the cache-shared source geometry)
    // gets disposed on unmount — r3f won't free <primitive> content.
    const disposables: { dispose: () => void }[] = []

    // Wire: hide each mesh's surface, hang its edge lines off the mesh so
    // they inherit the exact transform.
    const wire = scene.clone(true)
    const wireMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#aab2ba'),
      transparent: true,
      opacity: 1,
    })
    disposables.push(wireMat)
    wire.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const hidden = new THREE.MeshBasicMaterial({ visible: false })
      const edges = new THREE.EdgesGeometry(m.geometry, 12)
      disposables.push(hidden, edges)
      m.material = hidden
      m.add(new THREE.LineSegments(edges, wireMat))
    })
    normalize(wire)

    // Clay: one shared untextured material.
    const clay = scene.clone(true)
    const clayMat = new THREE.MeshStandardMaterial({
      color: '#8d8781',
      roughness: 0.9,
      metalness: 0.05,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    })
    clay.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) m.material = clayMat
    })
    normalize(clay)

    // Textured: the homepage's material rebuild, opacity managed per frame.
    const tex = scene.clone(true)
    disposables.push(...rebuildMaterials(tex))
    const texMats: THREE.MeshStandardMaterial[] = []
    tex.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        const mat = m.material as THREE.MeshStandardMaterial
        mat.transparent = true
        mat.opacity = 0
        texMats.push(mat)
      }
    })
    normalize(tex)
    disposables.push(clayMat)

    return { wire, wireMat, clay, clayMat, tex, texMats, disposables, tris: countTriangles(scene) }
  }, [scene])

  useEffect(() => {
    onStats(built.tris)
  }, [built, onStats])

  useEffect(() => {
    const { disposables } = built
    return () => disposables.forEach((d) => d.dispose())
  }, [built])

  useFrame((_, delta) => {
    const p = prog.p
    const w = 1 - ramp(p, 0.2, 0.34)
    const c = ramp(p, 0.18, 0.32) * (1 - ramp(p, 0.52, 0.66))
    const t = ramp(p, 0.52, 0.66)
    const n = ramp(p, 0.8, 0.93)

    // Mutations run through refs and setValues() — never property writes
    // on memoized objects — matching the homepage's useFrame discipline.
    built.wireMat.setValues({ opacity: w })
    built.clayMat.setValues({ opacity: c })
    for (const mat of built.texMats) {
      mat.setValues({ opacity: t, transparent: t < 0.999 })
    }
    if (wireRef.current) wireRef.current.visible = w > 0.001
    if (clayRef.current) clayRef.current.visible = c > 0.001
    if (texRef.current) texRef.current.visible = t > 0.001

    if (keyRef.current) {
      keyRef.current.intensity = 16 - 7 * n
      keyRef.current.color.set(n > 0.5 ? '#b8c4d8' : '#ffffff')
    }
    if (warmRef.current) warmRef.current.intensity = 15 * n
    if (poolRef.current) poolRef.current.opacity = 0.15 * n

    if (!reduced && spinRef.current) spinRef.current.rotation.y += delta * 0.16
  })

  return (
    <>
      <group ref={spinRef} rotation={[0, 0.7, 0]}>
        <primitive object={built.wire} ref={wireRef} />
        <primitive object={built.clay} ref={clayRef} />
        <primitive object={built.tex} ref={texRef} />
      </group>
      {/* the pool only exists in the last stage — the night rig arriving */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.05, 0]} scale={7} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={poolRef}
          map={poolTexture()}
          color="#ffb066"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <ambientLight intensity={0.12} />
      <hemisphereLight args={['#1c2430', '#0a0908']} intensity={0.22} />
      <pointLight ref={keyRef} position={[2.4, 2.6, 3.2]} intensity={16} />
      <pointLight ref={warmRef} position={[-1.6, -0.4, 1.8]} intensity={0} color="#ffb066" distance={9} decay={2} />
    </>
  )
}

export function PipelineScene({ reduced }: { reduced: boolean }) {
  const rootRef = useRef<HTMLElement>(null)
  const stageNameRef = useRef<HTMLSpanElement>(null)
  const [wrapRef, near, visible] = useNear<HTMLDivElement>()
  const [tris, setTris] = useState<number | null>(null)
  // Portrait viewports need the camera further back or the bike's
  // wheels crop out of frame. Read once at mount; a rotation mid-read
  // just gets a slightly looser or tighter crop.
  const [camZ] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 8.6 : 5.2
  )
  // Mutable scroll-progress carrier: GSAP writes it, useFrame reads it.
  // useState keeps the identity stable without ref reads during render.
  const [prog] = useState<Prog>(() => ({ p: 0 }))

  useGSAP(
    () => {
      if (reduced) return
      const root = rootRef.current
      if (!root) return
      const captions = gsap.utils.toArray<HTMLElement>('[data-stage-caption]', root)

      const mm = gsap.matchMedia()
      mm.add(
        { desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' },
        (ctx) => {
          const { mobile } = ctx.conditions as { mobile: boolean }

          gsap.set(captions, { autoAlpha: 0 })
          gsap.set(captions[0], { autoAlpha: 1 })

          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            // Read the stage from the timeline, not the trigger — the
            // scrub playhead keeps moving after the last scroll event.
            onUpdate: () => {
              const label = (tl.currentLabel() as string | null) ?? 'geometry'
              if (stageNameRef.current && stageNameRef.current.textContent !== label) {
                stageNameRef.current.textContent = label
              }
            },
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: () => '+=' + Math.round(window.innerHeight * (mobile ? 2.4 : 3.2)),
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              fastScrollEnd: true,
            },
          })

          // fromTo, not to: after a reduced-motion round trip prog may
          // hold a stale value, and the scrub must map from 0.
          tl.fromTo(prog, { p: 0 }, { p: 1, duration: 1 }, 0)
          const marks = [0, 0.25, 0.5, 0.8]
          STAGES.forEach((s, i) => {
            tl.addLabel(s.name, marks[i])
            if (i > 0) {
              tl.to(captions[i - 1], { autoAlpha: 0, y: -10, duration: 0.04 }, marks[i] - 0.05)
              tl.fromTo(captions[i], { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.05 }, marks[i])
            }
          })
        }
      )
      return () => mm.revert()
    },
    { scope: rootRef, dependencies: [reduced], revertOnUpdate: true }
  )

  const statsLine = tris
    ? `${tris.toLocaleString('en-US')} triangles · ${BIKE_BYTES.toLocaleString('en-US')} bytes · /models/bike.glb`
    : '/models/bike.glb'

  if (reduced) {
    return (
      <section aria-label="The pipeline, on the homepage bike" className="py-10">
        <div ref={wrapRef} className="mx-auto aspect-[4/3] w-full max-w-2xl" role="img" aria-label="The homepage bike model, textured and lit">
          {near && (
            <Canvas
              camera={{ position: [0, 0.5, camZ], fov: 36 }}
              dpr={[1, 1.5]}
              gl={{ alpha: true }}
              frameloop={frameloopFor(visible, true)}
            >
              <Suspense fallback={null}>
                <BikeStates prog={REDUCED_POSE} reduced onStats={setTris} />
              </Suspense>
            </Canvas>
          )}
        </div>
        <p className="mono mt-3">{statsLine}</p>
        <ol className="mt-8 flex max-w-[62ch] flex-col gap-6">
          {STAGES.map((s, i) => (
            <li key={s.name}>
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-faint)' }}>
                {String(i + 1).padStart(2, '0')} — {s.name}
              </p>
              <p className="mt-2 text-base leading-relaxed" style={{ color: 'var(--ink)' }}>
                {s.text}
              </p>
            </li>
          ))}
        </ol>
      </section>
    )
  }

  return (
    <section ref={rootRef} aria-label="The pipeline, on the homepage bike" className="relative h-svh">
      {/* Complete stage list for assistive tech: the animated captions
          below live at visibility:hidden except the active one, so AT
          gets this linear copy instead. */}
      <ol className="sr-only">
        {STAGES.map((s, i) => (
          <li key={s.name}>
            {String(i + 1).padStart(2, '0')}, {s.name}. {s.text}
          </li>
        ))}
      </ol>

      <div ref={wrapRef} className="absolute inset-0" role="img" aria-label="The homepage bike model rebuilding itself from wireframe to textured and lit">
        {near && (
          <Canvas
            camera={{ position: [0, 0.5, camZ], fov: 36 }}
            dpr={[1, 1.5]}
            gl={{ alpha: true }}
            frameloop={frameloopFor(visible, false)}
          >
            <Suspense fallback={null}>
              <BikeStates prog={prog} reduced={false} onStats={setTris} />
            </Suspense>
          </Canvas>
        )}
      </div>

      <p aria-hidden className="absolute right-0 top-8 text-right text-xs uppercase tracking-wide" style={{ color: 'var(--ink-faint)' }}>
        stage · <span ref={stageNameRef}>geometry</span>
      </p>

      <div className="absolute inset-x-0 bottom-8">
        <div aria-hidden className="relative min-h-[7.5rem] max-w-[46ch] md:min-h-[6rem]">
          {STAGES.map((s) => (
            <p
              key={s.name}
              data-stage-caption
              className="absolute inset-x-0 top-0 text-sm leading-relaxed md:text-base"
              style={{ color: 'var(--ink)' }}
            >
              {s.text}
            </p>
          ))}
        </div>
        <p className="mono mt-4">{statsLine}</p>
      </div>
    </section>
  )
}
