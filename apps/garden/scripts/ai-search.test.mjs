import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createSearchHandler } from '../src/lib/ai-search.mjs'

const request = body => new Request('https://garden.test/api/ai-search', { method: 'POST', body })

test('invalid JSON, empty/wrong query types and oversized queries never reach upstream', async () => {
  let calls = 0
  const handler = createSearchHandler(async () => { calls++; throw new Error('unexpected') })
  for (const body of ['{', 'null', '{}', '{"query":42}', '{"query":" "}', JSON.stringify({ query: 'x'.repeat(501) })]) {
    assert.equal((await handler(request(body))).status, 400)
  }
  assert.equal((await handler(request('x'.repeat(2049)))).status, 413)
  assert.equal(calls, 0)
})

test('bounds chunked request bodies without trusting Content-Length', async () => {
  let cancelled = false
  const body = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(1025)) }, cancel() { cancelled = true } })
  const req = new Request('https://garden.test', { method: 'POST', body, duplex: 'half' })
  const response = await createSearchHandler(async () => { throw new Error('unexpected') })(req)
  assert.equal(response.status, 413)
  assert(cancelled)
})

test('caps streamed output and cancels the upstream at the byte limit', async () => {
  let signal, cancelled = false
  const handler = createSearchHandler(async (_url, init) => {
    signal = init.signal
    assert.equal(JSON.parse(init.body).messages[0].content, 'hello')
    return new Response(new ReadableStream({ pull(c) { c.enqueue(new Uint8Array(20)) }, cancel() { cancelled = true } }))
  }, { maxOutputBytes: 32 })
  const response = await handler(request('{"query":" hello "}'))
  assert.equal((await response.arrayBuffer()).byteLength, 32)
  assert(signal.aborted)
  assert(cancelled)
})

test('upstream deadline aborts pending fetch without a quota call', async () => {
  const handler = createSearchHandler((_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
  }), { timeoutMs: 10 })
  assert.equal((await handler(request('{"query":"hello"}'))).status, 504)
})

test('client cancellation aborts the upstream stream', async () => {
  let signal
  const handler = createSearchHandler(async (_url, init) => {
    signal = init.signal
    return new Response(new ReadableStream({ pull(c) { c.enqueue(new Uint8Array(1)) } }))
  })
  const response = await handler(request('{"query":"hello"}'))
  await response.body.cancel()
  assert(signal.aborted)
})

test('deadline cancels an upstream stream that stops producing bytes', async () => {
  let cancelled = false
  const handler = createSearchHandler(async () => new Response(new ReadableStream({
    cancel() { cancelled = true },
  })), { timeoutMs: 10 })
  const response = await handler(request('{"query":"hello"}'))
  assert.equal((await response.arrayBuffer()).byteLength, 0)
  assert(cancelled)
})
