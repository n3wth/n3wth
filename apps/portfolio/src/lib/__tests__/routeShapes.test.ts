import { describe, expect, it } from 'vitest'
import { layerPath, lerpLayer, routePaths, routeShapes, storyKindFromPath, storyKinds } from '../routeShapes'

function commandCount(path: string) {
  return path.match(/C /g)?.length ?? 0
}

describe('route shapes', () => {
  it('keeps each layer morphable across sections', () => {
    const counts = storyKinds.map(kind => {
      const paths = routePaths(routeShapes[kind])
      return [commandCount(paths.circle), commandCount(paths.arc), commandCount(paths.blob)]
    })
    expect(new Set(counts.map(count => count.join(','))).size).toBe(1)
    expect(counts[0][1]).toBeGreaterThan(counts[0][0])
  })

  it('holds the endpoints of a morph', () => {
    const from = routeShapes.projects.circle
    const to = routeShapes.art.circle
    expect(layerPath(lerpLayer(from, to, 0))).toBe(layerPath(from))
    expect(layerPath(lerpLayer(from, to, 1))).toBe(layerPath(to))
    expect(layerPath(lerpLayer(from, to, 0.5))).not.toBe(layerPath(from))
  })

  it('recognizes only the six section paths', () => {
    expect(storyKindFromPath('/projects')).toBe('projects')
    expect(storyKindFromPath('/projects/')).toBe('projects')
    expect(storyKindFromPath('/projects/r3')).toBeNull()
    expect(storyKindFromPath('/')).toBeNull()
    expect(storyKindFromPath('/thinking/frameworks/5-whys')).toBeNull()
  })
})
