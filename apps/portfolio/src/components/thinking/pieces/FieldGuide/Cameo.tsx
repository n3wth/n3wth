import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { frameloopFor, useNear, useNormalizedClone } from './support'

/**
 * A small transparent canvas holding one real asset from /public/models,
 * lit with the homepage's night rig (weak ambient + key/fill points, no
 * HDRI). No frame, no card — the object sits straight on the page black,
 * slowly turning, the way LiveMaterialDemo mounts the rock. The canvas
 * itself only mounts once the wrapper is near the viewport.
 */

function Model({
  url,
  fit,
  tint,
  spin,
  reduced,
  rotation,
}: {
  url: string
  fit: number
  tint?: string
  spin: number
  reduced: boolean
  rotation?: [number, number, number]
}) {
  const clone = useNormalizedClone(url, fit, tint ?? '#ffffff')
  const ref = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (reduced || !ref.current) return
    ref.current.rotation.y += delta * spin
  })

  return (
    <group rotation={rotation ?? [0, 0, 0]}>
      <primitive object={clone} ref={ref} />
    </group>
  )
}

export function Cameo({
  url,
  label,
  fit = 1.8,
  tint,
  spin = 0.22,
  rotation,
  camera = [0, 0.4, 4.2],
  reduced,
  className = '',
}: {
  url: string
  /** Accessible one-line description of what the object is. */
  label: string
  fit?: number
  tint?: string
  spin?: number
  rotation?: [number, number, number]
  camera?: [number, number, number]
  reduced: boolean
  className?: string
}) {
  const [wrapRef, near, visible] = useNear<HTMLDivElement>()

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label={label}
      className={`aspect-square w-full ${className}`}
    >
      {near && (
        <Canvas camera={{ position: camera, fov: 38 }} dpr={[1, 1.5]} gl={{ alpha: true }} frameloop={frameloopFor(visible, reduced)}>
          <ambientLight intensity={0.14} />
          <hemisphereLight args={['#1c2430', '#0a0908']} intensity={0.24} />
          <pointLight position={[2, 2.4, 3]} intensity={16} />
          <pointLight position={[-2.6, 1.1, -1.8]} intensity={7} color="#dce6f2" />
          {/* Suspense stays inside the Canvas — outside it, every load
              remounts the WebGL context (the third night-field bug). */}
          <Suspense fallback={null}>
            <Model url={url} fit={fit} tint={tint} spin={reduced ? 0 : spin} reduced={reduced} rotation={rotation} />
          </Suspense>
        </Canvas>
      )}
    </div>
  )
}
