import test from 'node:test'
import assert from 'node:assert/strict'
import worker from './worker.mjs'

test('preserves every legacy documentation mapping and query values', () => {
  const aliases = {
    introduction: 'quickstart', installation: 'quickstart',
    'api-reference': 'memory-tools', 'api/client': 'memory-tools',
    'ai-intelligence': 'knowledge-graph', integrations: 'configuration',
    'sdks/python': 'transport', 'sdks/typescript': 'transport',
    examples: 'quickstart', 'examples/chatbot-memory': 'memory-tools',
    changelog: 'quickstart', 'getting-started/introduction': 'quickstart',
    'getting-started/quickstart': 'quickstart', 'getting-started/installation': 'quickstart',
    quickstart: 'quickstart', 'future/page': 'future/page',
  }
  for (const [source, target] of Object.entries(aliases)) {
    const response = worker.fetch(new Request(`https://r3.n3wth.com/docs/${source}?q=a&q=b`))
    assert.equal(response.status, 308)
    assert.equal(response.headers.get('location'), `https://docs.n3wth.com/r3/${target}?q=a&q=b`)
  }
})

test('preserves docs root, trailing slash, catch-all and request methods', () => {
  for (const method of ['GET', 'HEAD', 'POST']) {
    for (const [source, target] of [
      ['/docs', 'https://docs.n3wth.com/r3/quickstart'],
      ['/docs/', 'https://docs.n3wth.com/r3/quickstart'],
      ['/', 'https://n3wth.com/projects/r3'],
      ['/unknown', 'https://n3wth.com/projects/r3'],
    ]) {
      const response = worker.fetch(new Request(`https://r3.n3wth.com${source}`, { method }))
      assert.equal(response.status, 308)
      assert.equal(response.headers.get('location'), target)
    }
  }
})
