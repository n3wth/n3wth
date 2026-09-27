import { createElement } from 'react'
import { renderToReadableStream } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'

/** Wait for lazy article bodies; a failed subtree must fail the build. */
export async function renderBody(Body, path) {
  const errors = []
  const stream = await renderToReadableStream(
    createElement(MemoryRouter, { initialEntries: [path] }, createElement(Body)),
    { onError: error => { errors.push(error) } },
  )
  await stream.allReady
  if (errors.length) throw new AggregateError(errors, `Cannot prerender ${path}`)
  return new Response(stream).text()
}

/** Use the same TSX registry as the browser, without running browser effects. */
export async function renderThinkingBodies() {
  const server = await createServer({
    root: fileURLToPath(new URL('../..', import.meta.url)),
    server: { middlewareMode: true, watch: null },
    appType: 'custom',
    logLevel: 'error',
  })
  try {
    const { registeredPieces } = await server.ssrLoadModule('/src/components/thinking/registry.tsx')
    const bodies = new Map()
    for (const { meta, Body } of registeredPieces) {
      bodies.set(meta.id, await renderBody(Body, `/thinking/${meta.id}`))
    }
    return bodies
  } finally {
    await server.close()
  }
}
