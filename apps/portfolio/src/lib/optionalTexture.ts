import { use } from 'react'
import * as THREE from 'three'

/* A texture the scene can live without. `useTexture` from drei suspends
   and rethrows on any load error, so one dropped tile escapes the shared
   Suspense boundary and trips SceneBoundary, which swaps the whole night
   field for a still image. These helpers load with a couple of retries,
   then resolve to null instead of throwing. A mesh with a null map still
   renders in its base color, so a transient failure degrades one surface
   instead of the entire scene. Genuine WebGL context loss still throws
   from the reconciler and falls to SceneBoundary as before. */

const cache = new Map<string, Promise<THREE.Texture | null>>()

export function loadOptionalTexture(
  url: string,
  configure: (tex: THREE.Texture) => void,
  retries = 2,
): Promise<THREE.Texture | null> {
  const loader = new THREE.TextureLoader()
  const attempt = (left: number): Promise<THREE.Texture | null> =>
    new Promise((resolve) => {
      loader.load(
        url,
        (tex) => {
          configure(tex)
          resolve(tex)
        },
        undefined,
        () => resolve(left > 0 ? attempt(left - 1) : null),
      )
    })
  return attempt(retries)
}

export function useOptionalTexture(
  url: string,
  configure: (tex: THREE.Texture) => void,
): THREE.Texture | null {
  let promise = cache.get(url)
  if (!promise) {
    promise = loadOptionalTexture(url, configure)
    cache.set(url, promise)
  }
  return use(promise)
}
