import { describe, expect, it } from 'vitest'
import { handlePortfolioApi } from './runtime'

const request = (path: string, init?: RequestInit) => new Request(`https://preview.n3wth.com${path}`, init)

describe('portfolio Worker API runtime', () => {
  it('keeps the agent fallback path available without provider secrets', async () => {
    const response = await handlePortfolioApi(request('/api/agent', { method: 'POST', body: JSON.stringify({ message: 'tell me about trust' }) }), {})
    expect(response?.status).toBe(200)
    expect(await response?.json()).toEqual({
      reply: 'Trust is a runtime property, not a benchmark score. Safety classifiers need to run at feature latency. Feedback loops beat filters. Most teams never build the observability to know.',
      fallback: true,
    })
    expect(response?.headers.get('access-control-allow-origin')).toBe('*')
  })

  it('uses a synthetic Gemini response and never calls a second provider', async () => {
    const calls: string[] = []
    const fetchMock: typeof fetch = async (input) => {
      const url = String(input)
      calls.push(url)
      return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'synthetic reply' }] } }] }), { status: 200 })
    }
    const response = await handlePortfolioApi(request('/api/agent', { method: 'POST', body: JSON.stringify({ message: 'hello' }) }), { GEMINI_API_KEY: 'test-key', OPENROUTER_API_KEY: 'should-not-be-used' }, fetchMock)
    expect(await response?.json()).toEqual({ reply: 'synthetic reply' })
    expect(calls).toHaveLength(1)
    expect(calls[0]).toContain('generativelanguage.googleapis.com')
  })

  it('preserves non-streaming search JSON, citations, and CORS', async () => {
    const fetchMock: typeof fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: 'answer' } }], chunks: [{ item: { key: 'https://n3wth.com/work', metadata: { title: 'Work' } } }] }))
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work' }) }), {}, fetchMock)
    expect(await response?.json()).toEqual({ answer: 'answer Sources: [Work](https://n3wth.com/work).' })
    expect(response?.headers.get('access-control-allow-methods')).toBe('POST, OPTIONS')
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

  it('preserves search SSE deltas and terminal event', async () => {
    const upstream = ['event: chunks\n', 'data: [{"item":{"key":"https://n3wth.com/work"}}]\n\n', 'data: {"choices":[{"delta":{"content":"hello"}}]}\n\n', 'data: [DONE]\n\n'].join('')
    const fetchMock: typeof fetch = async () => new Response(upstream)
    const response = await handlePortfolioApi(request('/api/search', { method: 'POST', body: JSON.stringify({ query: 'work', stream: true }) }), {}, fetchMock)
    expect(response?.headers.get('content-type')).toContain('text/event-stream')
    const text = await response?.text()
    expect(text).toContain('"delta":"hello"')
    expect(text).toContain('"delta":" Sources: [work](https://n3wth.com/work)."')
    expect(text).toContain('data: [DONE]')
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

  it('keeps GitHub stats request, auth header, and error status behavior', async () => {
    const calls: Request[] = []
    const fetchMock: typeof fetch = async (input, init) => {
      calls.push(new Request(input, init))
      return new Response(JSON.stringify({ stargazers_count: 7, forks_count: 3 }))
    }
    const response = await handlePortfolioApi(request('/api/github-stats?owner=n3wth&repo=n3wth'), { GITHUB_TOKEN: 'synthetic-token' }, fetchMock)
    expect(await response?.json()).toEqual({ stars: 7, forks: 3 })
    expect(calls[0]?.headers.get('authorization')).toBe('token synthetic-token')
    expect((await handlePortfolioApi(request('/api/github-stats?owner=n3wth'), {}, fetchMock))?.status).toBe(400)
    expect((await handlePortfolioApi(request('/api/github-stats?owner=n3wth&owner=other&repo=n3wth'), {}, fetchMock))?.status).toBe(400)
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

  it('does not claim API ownership for unrelated paths', async () => {
    expect(await handlePortfolioApi(request('/work'))).toBeUndefined()
  })
})
