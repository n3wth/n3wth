import { use } from 'react'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

/* A model the scene can live without. drei's `useGLTF` suspends and
   rethrows on any load error, so one dropped GLB escapes its nested
   Suspense and trips SceneBoundary, which swaps the whole night field for
   a still image. This mirrors optionalTexture for GLB models: load with a
   couple of retries, then resolve to null instead of throwing. A caller
   that gets null simply skips that model, so a transient fetch failure
   drops one prop instead of the entire scene. Genuine WebGL context loss
   still throws from the reconciler and falls to SceneBoundary as before. */

const cache = new Map<string, Promise<GLTF | null>>()

export function loadOptionalGLTF(url: string, retries = 2): Promise<GLTF | null> {
  const loader = new GLTFLoader()
  const attempt = (left: number): Promise<GLTF | null> =>
    new Promise((resolve) => {
      loader.load(
        url,
        (gltf) => resolve(gltf),
        undefined,
        () => resolve(left > 0 ? attempt(left - 1) : null),
      )
    })
  return attempt(retries)
}

export function preloadOptionalGLTF(url: string): void {
  if (!cache.has(url)) cache.set(url, loadOptionalGLTF(url))
}

export function useOptionalGLTF(url: string): GLTF | null {
  let promise = cache.get(url)
  if (!promise) {
    promise = loadOptionalGLTF(url)
    cache.set(url, promise)
  }
  return use(promise)
}
