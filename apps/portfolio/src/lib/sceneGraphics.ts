export type SceneGraphics = 'hardware' | 'software' | 'unavailable'

/** Probe once before mounting the scene so expensive effects never start on software GL. */
export function getSceneGraphics(): SceneGraphics {
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null
  try {
    const canvas = document.createElement('canvas')
    gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return 'unavailable'
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = String(gl.getParameter(info?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER))
    return /swiftshader|llvmpipe|softpipe|lavapipe|software/i.test(renderer) ? 'software' : 'hardware'
  } catch {
    return 'unavailable'
  } finally {
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  }
}
