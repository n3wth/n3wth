import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * AI-powered answers over a Cloudflare AI Search namespace that crawls and
 * indexes n3wth.com, garden.n3wth.com, and ui.n3wth.com directly — no
 * client-side candidate list to build or keep in sync, and no LLM key to
 * rotate here. Cloudflare handles retrieval, embeddings, and generation;
 * this endpoint streams the response via SSE for faster perceived latency.
 */

const AI_SEARCH_ENDPOINT =
  'https://ns-5d811e45-2200-4a51-815d-66292af832dd.search.ai.cloudflare.com/chat/completions'

const SYSTEM_PROMPT = `You answer questions about n3wth.com and its related properties (the garden, @n3wth/ui) using ONLY the retrieved context. Never use outside knowledge about Oliver Newth or these projects.

Rules:
- Ground every claim in the retrieved context. If it doesn't answer the question, say so plainly and suggest browsing instead of guessing.
- Two to four sentences. No preamble, no "Based on the provided context".
- No marketing language, no emoji, no exclamation marks.
- Do not fabricate links yourself — citations are added separately.`

interface CFChunk {
  text: string
  score: number
  item: { key: string; metadata?: { title?: string } }
}

const HTML_ENTITIES: Record<string, string> = {
  '&quot;': '"',
  '&#39;': "'",
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
}

function decodeEntities(text: string): string {
  return text.replace(/&quot;|&#39;|&amp;|&lt;|&gt;/g, (m) => HTML_ENTITIES[m])
}

function titleFromKey(key: string): string {
  try {
    const url = new URL(key)
    const slug = url.pathname.replace(/\/$/, '').split('/').filter(Boolean).pop()
    return slug ? slug.replace(/[-_]/g, ' ') : url.hostname
  } catch {
    return key
  }
}

function buildCitations(chunks: CFChunk[]): string {
  const seen = new Set<string>()
  const links: string[] = []
  for (const chunk of chunks) {
    const key = chunk.item?.key
    if (!key || seen.has(key)) continue
    seen.add(key)
    const title = decodeEntities(chunk.item.metadata?.title ?? titleFromKey(key))
    links.push(`[${title}](${key})`)
    if (links.length >= 4) break
  }
  return links.length > 0 ? ` Sources: ${links.join(', ')}.` : ''
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { query, stream: wantsStream } = req.body as { query?: string; stream?: boolean }

  if (!query || typeof query !== 'string' || query.length > 300) {
    return res.status(400).json({ error: 'Invalid query' })
  }

  try {
    const response = await fetch(AI_SEARCH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query },
        ],
        max_tokens: 180,
        temperature: 0.3,
        stream: Boolean(wantsStream),
      }),
    })

    if (!response.ok) {
      console.error(`AI Search error (${response.status}):`, (await response.text()).slice(0, 200))
      return res.status(200).json({
        answer: "Couldn't reach the search index — try browsing instead.",
        fallback: true,
      })
    }

    if (wantsStream && response.body) {
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let currentEvent = ''
      let chunks: CFChunk[] = []
      let content = ''

      const processLine = (line: string) => {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim()
          return
        }

        if (!line.startsWith('data: ')) return
        const data = line.slice(6)

        if (data === '[DONE]') {
          const citations = buildCitations(chunks)
          if (citations) {
            res.write(`data: ${JSON.stringify({ delta: citations })}\n\n`)
          }
          res.write('data: [DONE]\n\n')
          return
        }

        try {
          if (currentEvent === 'chunks') {
            chunks = JSON.parse(data) as CFChunk[]
            currentEvent = ''
            return
          }

          const parsed = JSON.parse(data) as {
            choices?: Array<{ delta?: { content?: string } }>
          }
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) {
            content += delta
            res.write(`data: ${JSON.stringify({ delta })}\n\n`)
          }
        } catch {
          // Skip malformed JSON lines
        }
        currentEvent = ''
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            processLine(line)
          }
        }

        if (buffer.length > 0) {
          processLine(buffer)
        }

        if (!content) {
          res.write(`data: ${JSON.stringify({ delta: "Couldn't generate an answer — try browsing instead." })}\n\n`)
          res.write('data: [DONE]\n\n')
        }
      } finally {
        reader.releaseLock()
        res.end()
      }
      return
    }

    // Non-streaming fallback
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
      chunks?: CFChunk[]
    }
    const content = data.choices?.[0]?.message?.content
    if (content) {
      const answer = content.trim() + buildCitations(data.chunks ?? [])
      return res.status(200).json({ answer })
    }
  } catch (err) {
    console.error('AI Search fetch error:', err)
  }

  return res.status(200).json({
    answer: "Couldn't reach the search index — try browsing instead.",
    fallback: true,
  })
}
