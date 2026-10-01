import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSceneGraphics } from '../sceneGraphics'

afterEach(() => vi.restoreAllMocks())

describe('scene graphics capability', () => {
  it.each([
    ['ANGLE (SwiftShader Device)', 'software'],
    ['llvmpipe (LLVM)', 'software'],
    ['ANGLE (Apple M3)', 'hardware'],
  ])('classifies %s and releases the probe context', (renderer, expected) => {
    const loseContext = vi.fn()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      getExtension: (name: string) => name === 'WEBGL_lose_context' ? { loseContext } : { UNMASKED_RENDERER_WEBGL: 37446 },
      getParameter: () => renderer,
    } as unknown as WebGLRenderingContext)
    expect(getSceneGraphics()).toBe(expected)
    expect(loseContext).toHaveBeenCalledOnce()
  })

  it('uses the static fallback when WebGL is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    expect(getSceneGraphics()).toBe('unavailable')
  })
})
