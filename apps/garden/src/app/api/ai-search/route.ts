import { NextRequest } from 'next/server'

const AI_SEARCH_ENDPOINT =
  'https://ns-5d811e45-2200-4a51-815d-66292af832dd.search.ai.cloudflare.com/chat/completions'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { query } = await req.json()

  if (!query || typeof query !== 'string') {
    return new Response(JSON.stringify({ error: 'Query required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const response = await fetch(AI_SEARCH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
      stream: true,
    }),
    signal: req.signal,
  })

  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: 'AI search failed', status: response.status }),
      {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
