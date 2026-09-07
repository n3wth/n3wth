import { afterEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { loadOptionalTexture } from '../optionalTexture'

/* Drive TextureLoader.load's success or error callback on demand, so a
   test decides whether the download works. */
function mockLoad(outcome: 'ok' | 'fail') {
  return vi
    .spyOn(THREE.TextureLoader.prototype, 'load')
    .mockImplementation((_url, onLoad, _onProgress, onError) => {
      if (outcome === 'ok') onLoad?.(new THREE.Texture())
      else onError?.(new ErrorEvent('error'))
      return new THREE.Texture()
    })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('loadOptionalTexture', () => {
  it('resolves to null after retries instead of rejecting', async () => {
    const load = mockLoad('fail')
    const configure = vi.fn()
    await expect(
      loadOptionalTexture('/textures/x.webp', configure, 2),
    ).resolves.toBeNull()
    expect(load).toHaveBeenCalledTimes(3) // first try + 2 retries
    expect(configure).not.toHaveBeenCalled()
  })

  it('configures and resolves the texture on success', async () => {
    mockLoad('ok')
    const configure = vi.fn()
    const tex = await loadOptionalTexture('/textures/y.webp', configure)
    expect(tex).toBeInstanceOf(THREE.Texture)
    expect(configure).toHaveBeenCalledTimes(1)
  })
})
