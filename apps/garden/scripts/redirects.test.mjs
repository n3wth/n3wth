import assert from 'node:assert/strict'
import test from 'node:test'
import worker from '../worker.mjs'
import redirects from '../redirects.json' with { type: 'json' }

const request = (path, method = 'GET', env) => worker.fetch(new Request(`https://garden.n3wth.com${path}`, { method }), env)

test('every published route redirects to its canonical destination', () => {
  for (const [source, target] of Object.entries(redirects)) {
    const response = request(source)
    assert.equal(response.status, 308, source)
    assert.equal(response.headers.get('location'), new URL(target, 'https://n3wth.com').href, source)
  }
})

test('redirects preserve queries, target fragments, trailing slashes and preview origin', async () => {
  assert.equal(request('/notes/?ref=old').headers.get('location'), 'https://n3wth.com/thinking?ref=old#notes')
  assert.equal(request('/notes?ref=a&ref=b').headers.get('location'), 'https://n3wth.com/thinking?ref=a&ref=b#notes')
  assert.equal(request('/', 'HEAD').status, 308)
  assert.equal(await request('/', 'HEAD').text(), '')
  assert.equal(request('/', 'GET', { TARGET_ORIGIN: 'https://portfolio-pr-1.preview.n3wth.com' }).headers.get('location'), 'https://portfolio-pr-1.preview.n3wth.com/')
  assert.equal(request('/__health').status, 200)
  assert.equal(request('/__health').headers.get('x-robots-tag'), 'noindex')
  assert.equal(request('/not-a-real-note').status, 404)
  assert.equal(request('/figures/not-a-real-asset.svg').status, 404)
  assert.equal(request('/%E0%A4%A').status, 400)
  assert.equal(request('/', 'POST').status, 405)
})
