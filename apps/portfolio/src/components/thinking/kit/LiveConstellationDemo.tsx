import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { AspectRatio } from '@astryxdesign/core/AspectRatio'
import * as THREE from 'three'

/**
 * The real radio telescope from the homepage (src/components/NightField.tsx's
 * Constellation, standing in for /work): /models/telescope.glb, a
 * Hyper3D-generated PBR mesh. Same material-rebuild rule as LiveMaterialDemo —
 * generated GLBs ship exotic material state, so the material is rebuilt from
 * scratch on load rather than patched.
 *
 * Unlike the field's version, this one isn't pinned to a fixed scene
 * position and scale: it's normalized to a comfortable size from its own
 * bounding box, the same way LiveMaterialDemo normalizes the rock, so it
 * drops into any Beat regardless of the source asset's real-world scale.
 *
 * No frame, no card — transparent canvas straight on the page's own black.
 * Suspense for the GLTF load lives inside the Canvas, not outside it (see
 * src/components/thinking/pieces/NightField.tsx for why that placement
 * matters).
 */

function RealTelescope() {
  const { scene } = useGLTF('/models/telescope.glb')
  const ref = useRef<THREE.Group>(null)
  const azimuth = useRef<THREE.Group>(null)
  const { pointer } = useThree()
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  const prepared = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const scale = 1.8 / Math.max(size.x, size.y, size.z, 0.001)
    clone.children.forEach((c) => c.position.sub(center))
    clone.scale.setScalar(scale)
    return clone
  }, [scene])

  useEffect(() => {
    prepared.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const old = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshStandardMaterial
      m.material = new THREE.MeshStandardMaterial({
        map: old.map ?? null,
        color: old.map ? new THREE.Color('#7e848c') : (old.color ?? new THREE.Color(0x888888)),
        roughness: 0.65,
        metalness: 0.2,
        side: THREE.DoubleSide,
      })
      m.frustumCulled = false
    })
  }, [prepared])

  useFrame(({ clock }, delta) => {
    if (!reduced && azimuth.current) {
      // one slow sweep and back, the same alt-az drift as the real dish
      azimuth.current.rotation.y = Math.sin(clock.elapsedTime * 0.045) * 0.5
    }
    if (reduced || !ref.current) return
    const targetTiltX = pointer.y * 0.2
    const targetTiltZ = -pointer.x * 0.2
    ref.current.rotation.x += (targetTiltX - ref.current.rotation.x) * Math.min(1, delta * 2)
    ref.current.rotation.z += (targetTiltZ - ref.current.rotation.z) * Math.min(1, delta * 2)
  })

  return (
    <group ref={ref}>
      <group ref={azimuth}>
        <primitive object={prepared} />
      </group>
    </group>
  )
}

export default function LiveConstellationDemo() {
  return (
    <div data-reveal>
      {/* Square and centered, not full-width — a wide-short mount would
          crop the dish top and bottom the same way it would the rock. */}
      <div className="mx-auto w-full max-w-md">
        <AspectRatio ratio={1}>
          <Canvas camera={{ position: [0, 0.4, 4.6], fov: 40 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
            {/* Same lighting language as NightField's Constellation: a cool
                key rims the dish edge from behind-left, a weaker fill keeps
                the pedestal legible — no frontal floodlight, which flattens
                the bowl into a white disc. */}
            <ambientLight intensity={0.1} />
            <hemisphereLight args={['#1c2430', '#0a0908']} intensity={0.2} />
            <pointLight position={[-2.5, 2.6, -2]} intensity={20} color="#b8c4d8" />
            <pointLight position={[0, 0.8, 1.6]} intensity={9} color="#8fa8d8" />
            {/* The Suspense boundary for this GLTF load lives inside the
                Canvas — see the paragraph above. */}
            <Suspense fallback={null}>
              <RealTelescope />
            </Suspense>
          </Canvas>
        </AspectRatio>
      </div>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
        The real radio telescope from the homepage — /models/telescope.glb,
        Hyper3D-generated. Same mesh, same alt-az sweep, normalized to fit
        wherever it's dropped.
      </p>
    </div>
  )
}
