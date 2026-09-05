import { afterEach, describe, expect, it, vi } from 'vitest'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { loadOptionalGLTF } from '../optionalGLTF'

/* Drive GLTFLoader.load's success or error callback on demand, so a test
   decides whether the download works. */
function mockLoad(outcome: 'ok' | 'fail') {
  return vi
    .spyOn(GLTFLoader.prototype, 'load')
    .mockImplementation((_url, onLoad, _onProgress, onError) => {
      if (outcome === 'ok') onLoad?.({ scene: {} } as GLTF)
      else onError?.(new ErrorEvent('error'))
    })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('loadOptionalGLTF', () => {
  it('resolves to null after retries instead of rejecting', async () => {
    const load = mockLoad('fail')
    await expect(loadOptionalGLTF('/models/x.glb', 2)).resolves.toBeNull()
    expect(load).toHaveBeenCalledTimes(3) // first try + 2 retries
  })

  it('resolves the model on success', async () => {
    mockLoad('ok')
    const gltf = await loadOptionalGLTF('/models/y.glb')
    expect(gltf).not.toBeNull()
    expect(gltf?.scene).toBeDefined()
  })
})
