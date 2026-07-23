import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * The actual bug from the night-field build, live: a generated mesh's
 * material shipping with metalness=1 and no env map renders black under
 * a point light. Toggling rebuilds the material the same way the real
 * fix does (src/components/NightField.tsx's GLB loaders) — roughness up,
 * metalness down, same geometry, same light. One Canvas, one mesh; only
 * the material changes, so the difference is real, not two screenshots.
 */

function Knot({ broken }: { broken: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )
  useFrame((_, delta) => {
    if (reduced || !ref.current) return
    ref.current.rotation.y += delta * 0.35
    ref.current.rotation.x += delta * 0.12
  })
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.85, 0.28, 128, 24]} />
      {broken ? (
        <meshStandardMaterial color="#d8dde3" metalness={1} roughness={0.1} />
      ) : (
        <meshStandardMaterial color="#d8dde3" metalness={0.15} roughness={0.7} />
      )}
    </mesh>
  )
}

export default function LiveMaterialDemo() {
  const [broken, setBroken] = useState(true)

  return (
    <div data-reveal>
      <div
        role="group"
        aria-label="Broken or fixed material"
        className="inline-flex rounded-full p-0.5"
        style={{ border: '1px solid var(--rail)' }}
      >
        {[
          { label: 'renders black', value: true },
          { label: 'renders lit', value: false },
        ].map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            aria-pressed={broken === opt.value}
            onClick={() => setBroken(opt.value)}
            className="rounded-full px-4 py-1.5 text-sm transition-colors"
            style={{
              color: broken === opt.value ? 'var(--accent-ink)' : 'var(--ink-dim)',
              background: broken === opt.value ? 'var(--accent)' : 'transparent',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div
        className="mt-6 h-64 w-full overflow-hidden rounded-md"
        style={{ border: '1px solid var(--rail)', background: '#08090b' }}
      >
        <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }} dpr={[1, 1.5]}>
          <ambientLight intensity={0.05} />
          <pointLight position={[2, 2, 3]} intensity={broken ? 8 : 22} />
          <Knot broken={broken} />
        </Canvas>
      </div>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
        Same mesh, same light. Rodin/Hyper3D GLBs ship spec-gloss extensions and
        metalness=1 — black under a point light with no environment map. The fix
        is a material rebuild on load, not a lighting change.
      </p>
    </div>
  )
}
