import test from 'node:test'
import assert from 'node:assert/strict'
import worker from './worker.mjs'

test('preserves static redirect mappings, wildcard paths, status and query', () => {
  for (const [path, target] of [
    ['/docs', 'https://docs.n3wth.com/ui/quickstart'],
    ['/docs/getting-started', 'https://docs.n3wth.com/ui/quickstart'],
    ['/docs/theming', 'https://docs.n3wth.com/ui/theme-provider'],
    ['/docs/components', 'https://docs.n3wth.com/ui/primitives'],
    ['/docs/hooks', 'https://docs.n3wth.com/ui/scroll-reset'],
    ['/docs/css-utilities', 'https://docs.n3wth.com/ui/tailwind'],
    ['/docs/future/page', 'https://docs.n3wth.com/ui/future/page'],
    ['/', 'https://n3wth.com/projects/ui'],
    ['/unknown', 'https://n3wth.com/projects/ui'],
  ]) {
    for (const method of ['GET', 'HEAD', 'POST']) {
      const response = worker.fetch(new Request(`https://ui.n3wth.com${path}?q=a&q=b`, { method }))
      assert.equal(response.status, 301)
      assert.equal(response.headers.get('location'), `${target}?q=a&q=b`)
    }
  }
})
