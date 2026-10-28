import { afterEach, describe, expect, it, vi } from 'vitest'
import { handlePortfolioApi } from './runtime'

const request = (path: string, init?: RequestInit) => new Request(`https://preview.n3wth.com${path}`, init)
afterEach(() => vi.restoreAllMocks())

describe('portfolio Worker API runtime', () => {
  it.each(['/api/agent', '/api/github-stats'])('returns gone for retired endpoint %s', async path => {
    const response = await handlePortfolioApi(request(path), {})
    expect(response?.status).toBe(410)
    expect(await response?.json()).toEqual({ error: 'This endpoint has been retired' })
  })

  it('preserves non-streaming search JSON, citations, and CORS', async () => {
    const fetchMock: typeof fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: 'answer' } }], chunks: [{ item: { key: 'https://n3wth.com/work', metadata: { title: 'Work' } } }] }))
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work' }) }), {}, fetchMock)
    expect(await response?.json()).toEqual({ answer: 'answer Sources: [Work](https://n3wth.com/work).' })
    expect(response?.headers.get('access-control-allow-methods')).toBe('POST, OPTIONS')
  })

  it('returns opt-in structured JSON without changing answer text', async () => {
    const answer = 'Notes Sources: [guide](https://example.com).'
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work', responseFormat: 2 }) }), {}, async () => Response.json({ choices: [{ message: { content: answer } }], chunks: [{ item: { key: 'https://n3wth.com/work', metadata: { title: 'Work' } } }] }))
    expect(await response?.json()).toEqual({ format: 2, answer, sources: [{ label: 'Work', href: 'https://n3wth.com/work' }] })
  })

  it('separates streamed sources from answer deltas when requested', async () => {
    const answer = 'Notes Sources: [guide](https://example.com).'
    const upstream = 'event: chunks\ndata: [{"item":{"key":"https://n3wth.com/work"}}]\n\n'
      + `data: ${JSON.stringify({ choices: [{ delta: { content: answer } }] })}\n\ndata: [DONE]\n\n`
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work', stream: true, responseFormat: 2 }) }), {}, async () => new Response(upstream))
    const events = (await response!.text()).split('\n\n').filter(Boolean)
    expect(events).toEqual([
      'data: {"format":2}',
      `data: ${JSON.stringify({ delta: answer })}`,
      'data: {"sources":[{"label":"work","href":"https://n3wth.com/work"}]}',
      'data: [DONE]',
    ])
  })

  it('does not emit structured sources for an interrupted stream', async () => {
    const upstream = 'event: chunks\ndata: [{"item":{"key":"https://n3wth.com/work"}}]\n\n'
      + 'data: {"choices":[{"delta":{"content":"partial"}}]}\n\n'
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work', stream: true, responseFormat: 2 }) }), {}, async () => new Response(upstream))
    const text = await response!.text()
    expect(text).toContain('"format":2')
    expect(text).toContain('"fallback":true')
    expect(text).not.toContain('"sources"')
  })

  it('returns no structured sources when the answer abstains', async () => {
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work', responseFormat: 2 }) }), {}, async () => Response.json({ choices: [{ message: { content: 'No relevant information found. Try another search.' } }], chunks: [{ item: { key: 'https://n3wth.com/work' } }] }))
    expect(await response?.json()).toEqual({ format: 2, answer: 'No relevant information found. Try another search.', sources: [] })
  })

  it.each(['null', '{', JSON.stringify({ query: '   ' }), JSON.stringify({ query: 'a', padding: 'x'.repeat(4096) })])('rejects invalid or oversized search bodies', async body => {
    let called = false
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body, headers: { 'Content-Length': '1' } }), {}, async () => {
      called = true
      return new Response()
    })
    expect(response?.status).toBe(400)
    expect(called).toBe(false)
  })

  it.each([
    ['My work experience', 'Oliver Newth work experience'],
    ['work experience', 'Oliver Newth work experience'],
    ['your career', 'Oliver Newth career'],
    ['fgh', 'fgh'],
    ['Ada Lovelace work experience', 'Ada Lovelace work experience'],
    ['Career of Ada Lovelace', 'Career of Ada Lovelace'],
  ])('grounds portfolio shorthand before retrieval: %s', async (query, expected) => {
    let sent: { messages: Array<{ content: string }> } | undefined
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query }) }), {}, async (_input, init) => {
      sent = JSON.parse(String(init?.body))
      return Response.json({ model: 'provider-model', choices: [{ message: { content: 'A supported answer.' } }] })
    })
    expect(sent?.messages[1].content).toBe(expected)
    expect(await response?.json()).toEqual({ answer: 'A supported answer.', model: 'provider-model' })
  })

  it('forwards the observed model once during streaming', async () => {
    const event = `data: ${JSON.stringify({ model: 'provider-model', choices: [{ delta: { content: 'hello' } }] })}\n\n`
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'r3', stream: true }) }), {}, async () => new Response(event + event + 'data: [DONE]\n\n'))
    expect((await response?.text())?.match(/"model":"provider-model"/g)).toHaveLength(1)
  })

  it.each([{}, 42, 'invalid'])('preserves a valid answer when citation metadata is malformed: %j', async chunks => {
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work' }) }), {}, async () => Response.json({ choices: [{ message: { content: 'A supported answer.' } }], chunks }))
    expect(await response?.json()).toEqual({ answer: 'A supported answer.' })
  })

  it('preserves search SSE deltas and terminal event', async () => {
    const upstream = ['event: chunks\n', 'data: [{"item":{"key":"https://n3wth.com/work"}}]\n\n', 'data: {"choices":[{"delta":{"content":"hello"}}]}\n\n', 'data: [DONE]\n\n'].join('')
    const fetchMock: typeof fetch = async () => new Response(upstream)
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work', stream: true }) }), {}, fetchMock)
    expect(response?.headers.get('content-type')).toContain('text/event-stream')
    const text = await response?.text()
    expect(text).toContain('"delta":"hello"')
    expect(text).toContain('"delta":" Sources: [work](https://n3wth.com/work)."')
    expect(text).not.toContain('"fallback":true')
    expect(text).toContain('data: [DONE]')
  })

  it('handles CRLF streams and emits exactly one terminal event', async () => {
    const upstream = 'event: chunks\r\ndata: [{"item":{"key":"https://n3wth.com/work"}}]\r\n\r\n'
      + 'data: {"choices":[{"delta":{"content":"hello"}}]}\r\n\r\ndata: [DONE]\r\n\r\n'
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work', stream: true }) }), {}, async () => new Response(upstream))
    const text = await response?.text()
    expect(text).toContain('Sources: [work](https://n3wth.com/work)')
    expect(text?.match(/data: \[DONE\]/g)).toHaveLength(1)
  })

  it.each(['', 'data: {"choices":[{"delta":{"content":"partial"}}]}\n\n'])('terminates an incomplete stream once', async upstream => {
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work', stream: true }) }), {}, async () => new Response(upstream))
    const text = await response?.text()
    expect(text?.match(/data: \[DONE\]/g)).toHaveLength(1)
    expect(text).toContain(upstream ? 'partial' : "Couldn't generate an answer")
    expect(text).toContain('"fallback":true')
    if (upstream) expect(text).toContain('Answer interrupted. Try again.')
  })

  it('ends a failed partial response without citing candidates', async () => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('event: chunks\ndata: [{"item":{"key":"https://n3wth.com/work"}}]\n\ndata: {"choices":[{"delta":{"content":"partial"}}]}\n\n'))
      },
      pull: controller => controller.error(new Error('upstream failure')),
    })
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work', stream: true }) }), {}, async () => new Response(body))
    const text = await response?.text()
    expect(text).toContain('partial')
    expect(text).toContain('Answer interrupted. Try again.')
    expect(text).toContain('"fallback":true')
    expect(text).not.toContain('Sources:')
    expect(text?.match(/data: \[DONE\]/g)).toHaveLength(1)
  })

  it('ignores malformed citation data and completes the stream', async () => {
    const upstream = 'event: chunks\ndata: [null,{"item":{"key":"https://n3wth.com/work","metadata":{"title":3}}}]\n\n'
      + 'data: {"choices":[{"delta":{"content":"hello"}}]}\n\ndata: [DONE]\n\n'
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work', stream: true }) }), {}, async () => new Response(upstream))
    const text = await response?.text()
    expect(text).toContain('Sources: [work](https://n3wth.com/work)')
    expect(text?.match(/data: \[DONE\]/g)).toHaveLength(1)
  })

  it('closes after DONE even when the upstream stays open', async () => {
    let canceled = false
    const body = new ReadableStream<Uint8Array>({
      start: controller => controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n')),
      cancel: () => { canceled = true },
    })
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work', stream: true }) }), {}, async () => new Response(body))
    expect((await response?.text())?.match(/data: \[DONE\]/g)).toHaveLength(1)
    expect(canceled).toBe(true)
  })

  it.each([
    'No relevant information found. Try another search.',
    'The provided documents do not contain any information related to the query "fgh". It is not possible to provide a relevant answer based on the retrieved context.',
  ])('does not cite unrelated retrieval candidates for an abstention: %s', async answer => {
    const chunks = [{ item: { key: 'https://n3wth.com/elsa' } }]
    const fetchMock: typeof fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: answer } }], chunks }))
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'fgh' }) }), {}, fetchMock)
    expect(await response?.json()).toEqual({ answer: 'No relevant information found. Try another search.' })

    // Split the answer across deltas: abstention detection must use the whole response.
    const upstream = `event: chunks\ndata: ${JSON.stringify(chunks)}\n\n`
      + [answer.slice(0, 20), answer.slice(20)].map(content => `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`).join('')
      + 'data: [DONE]\n\n'
    const streamed = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'fgh', stream: true }) }), {}, async () => new Response(upstream))
    const text = await streamed?.text()
    expect(text).not.toContain('Sources:')
    expect(text).not.toContain('https://n3wth.com/elsa')
    expect(text).toContain('data: [DONE]')
  })


  it('cancels an upstream search reader when the client cancels the SSE response', async () => {
    let canceled = false
    const upstreamBody = new ReadableStream<Uint8Array>({
      pull: () => new Promise(() => {}),
      cancel: () => { canceled = true },
    })
    const fetchMock: typeof fetch = async () => new Response(upstreamBody)
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work', stream: true }) }), {}, fetchMock)
    await response?.body?.cancel('client disconnected')
    expect(canceled).toBe(true)
  })

  it('closes SSE with fallback after an upstream reader error', async () => {
    const upstreamBody = new ReadableStream<Uint8Array>({
      pull: controller => { controller.error(new Error('upstream failure')) },
    })
    const fetchMock: typeof fetch = async () => new Response(upstreamBody)
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work', stream: true }) }), {}, fetchMock)
    await expect(response?.text()).resolves.toContain("Couldn't generate an answer")
  })

  it('returns the fallback when the upstream connection exceeds the deadline', async () => {
    const deadline = new AbortController()
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(deadline.signal)
    let started!: () => void
    const ready = new Promise<void>(resolve => { started = resolve })
    const pending = handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work' }) }), {}, async (_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true })
      started()
    }))
    await ready
    expect(timeout).toHaveBeenCalledWith(20_000)
    deadline.abort()
    expect(await (await pending)?.json()).toEqual({ answer: "Couldn't reach the search index — try browsing instead.", fallback: true })
  })

  it('propagates client cancellation before the deadline', async () => {
    const deadline = new AbortController()
    const client = new AbortController()
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(deadline.signal)
    let started!: () => void
    const ready = new Promise<void>(resolve => { started = resolve })
    let upstreamSignal: AbortSignal | null | undefined
    const pending = handlePortfolioApi(request('/api/search', { method: 'POST', signal: client.signal, body: JSON.stringify({ query: 'work' }) }), {}, async (_input, init) => new Promise((_resolve, reject) => {
      upstreamSignal = init?.signal
      upstreamSignal?.addEventListener('abort', () => reject(upstreamSignal?.reason), { once: true })
      started()
    }))
    await ready
    client.abort()
    expect(upstreamSignal?.aborted).toBe(true)
    expect(deadline.signal.aborted).toBe(false)
    await pending
  })

  it.each([false, true])('ends a stalled stream after the deadline (partial answer: %s)', async partial => {
    const deadline = new AbortController()
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(deadline.signal)
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work', stream: true }) }), {}, async (_input, init) => {
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          if (partial) controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"partial"}}]}\n\n'))
          init?.signal?.addEventListener('abort', () => controller.error(init.signal?.reason), { once: true })
        },
      })
      return new Response(body)
    })
    const result = response!.text()
    deadline.abort()
    const text = await result
    expect(text).toContain(partial ? 'partial' : "Couldn't generate an answer")
    expect(text).toContain('"fallback":true')
    if (partial) expect(text).toContain('Answer interrupted. Try again.')
    expect(text.match(/data: \[DONE\]/g)).toHaveLength(1)
    expect(text).not.toContain('Sources:')
  })

  it('does not claim API ownership for unrelated paths', async () => {
    expect(await handlePortfolioApi(request('/work'))).toBeUndefined()
  })
})
