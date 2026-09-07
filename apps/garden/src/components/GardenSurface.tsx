'use client'

import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'

/** The soil can fail to load without taking the interactive garden with it. */
export function GardenSurface({ tint }: { tint: string }) {
  const [maps, setMaps] = useState<Record<string, THREE.Texture>>({})
  const color = useMemo(() => new THREE.Color(tint).multiplyScalar(14), [tint])

  useEffect(() => {
    let active = true
    const loaded: THREE.Texture[] = []
    const loader = new THREE.TextureLoader()
    for (const name of ['color', 'normal', 'roughness']) {
      loader.load(`/textures/soil-${name}.webp`, (texture) => {
        if (!active) { texture.dispose(); return }
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(36, 36)
        texture.anisotropy = 4
        texture.colorSpace = name === 'color' ? THREE.SRGBColorSpace : THREE.NoColorSpace
        loaded.push(texture)
        setMaps((current) => ({ ...current, [name]: texture }))
      }, undefined, () => { /* Keep the plain soil material on a failed request. */ })
    }
    return () => { active = false; loaded.forEach((texture) => texture.dispose()) }
  }, [])

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.015}>
      <planeGeometry args={[180, 180]} />
      <meshStandardMaterial color={color} map={maps.color ?? null}
        normalMap={maps.normal ?? null} normalScale={[0.65, 0.65]}
        roughnessMap={maps.roughness ?? null} roughness={1} metalness={0} />
    </mesh>
  )
}
