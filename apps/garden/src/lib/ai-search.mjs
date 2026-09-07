const endpoint = 'https://ns-5d811e45-2200-4a51-815d-66292af832dd.search.ai.cloudflare.com/chat/completions'
const errorResponse = (status, error) => Response.json({ error }, { status })

/** @param {typeof fetch} fetchUpstream */
export function createSearchHandler(fetchUpstream = fetch, { timeoutMs = 15000, maxOutputBytes = 65536 } = {}) {
  /** @param {Request} req */
  return async function search(req) {
    const upstream = new AbortController()
    const abort = () => upstream.abort()
    req.signal.addEventListener('abort', abort, { once: true })
    if (req.signal.aborted) abort()
    const timer = setTimeout(abort, timeoutMs)
    let cancelStream = () => {}
    const cleanup = () => {
      clearTimeout(timer)
      req.signal.removeEventListener('abort', abort)
      upstream.signal.removeEventListener('abort', cancelStream)
    }
    let requestReader
    let streamOwnsCleanup = false
    try {
      if (upstream.signal.aborted) return errorResponse(408, 'Request cancelled')
      if (Number(req.headers.get('content-length')) > 2048) return errorResponse(413, 'Request too large')
      requestReader = req.body?.getReader()
      const cancelRequest = () => { void requestReader?.cancel().catch(() => {}) }
      upstream.signal.addEventListener('abort', cancelRequest, { once: true })
      let text = ''
      let bytes = 0
      const decoder = new TextDecoder()
      try {
        if (requestReader) {
          while (true) {
            const { done, value } = await requestReader.read()
            if (done) break
            bytes += value.byteLength
            if (bytes > 2048) {
              await requestReader.cancel()
              return errorResponse(413, 'Request too large')
            }
            text += decoder.decode(value, { stream: true })
          }
        }
        text += decoder.decode()
      } finally { upstream.signal.removeEventListener('abort', cancelRequest) }
      if (upstream.signal.aborted) return errorResponse(408, 'Request timed out')
      let body
      try { body = JSON.parse(text) } catch { return errorResponse(400, 'Invalid JSON') }
      const query = typeof body?.query === 'string' ? body.query.trim() : ''
      if (!query || query.length > 500) return errorResponse(400, 'Query must contain 1 to 500 characters')
      const response = await fetchUpstream(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: query }], stream: true }),
        signal: upstream.signal,
      })
      if (!response.ok || !response.body) {
        await response.body?.cancel()
        return errorResponse(502, 'Search unavailable')
      }
      const reader = response.body.getReader()
      cancelStream = () => { void reader.cancel().catch(() => {}) }
      upstream.signal.addEventListener('abort', cancelStream, { once: true })
      if (upstream.signal.aborted) cancelStream()
      let sent = 0
      const stream = new ReadableStream({
        async pull(controller) {
          try {
            const { done, value } = await reader.read()
            if (done) { cleanup(); controller.close(); return }
            const remaining = maxOutputBytes - sent
            controller.enqueue(value.subarray(0, remaining))
            sent += Math.min(value.byteLength, remaining)
            if (sent >= maxOutputBytes) {
              upstream.abort(); void reader.cancel().catch(() => {}); cleanup(); controller.close()
            }
          } catch { cleanup(); controller.error(new Error('Search stream ended')) }
        },
        cancel() { upstream.abort(); cleanup(); return reader.cancel().catch(() => {}) },
      })
      // The stream owns cleanup until completion, cancellation or the deadline.
      streamOwnsCleanup = true
      return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } })
    } catch {
      return errorResponse(upstream.signal.aborted ? 504 : 502, 'Search unavailable')
    } finally {
      // Only successful streaming responses keep the deadline alive.
      if (!streamOwnsCleanup) cleanup()
    }
  }
}
