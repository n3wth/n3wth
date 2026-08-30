import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * AI-powered answers over a Cloudflare AI Search namespace that crawls and
 * indexes n3wth.com, garden.n3wth.com, and ui.n3wth.com directly — no
 * client-side candidate list to build or keep in sync, and no LLM key to
 * rotate here. Cloudflare handles retrieval, embeddings, and generation;
 * this endpoint just calls its public namespace endpoint and turns the
 * returned chunks into real citations.
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

interface CFResponse {
  choices?: Array<{ message?: { content?: string } }>
  chunks?: CFChunk[]
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
    const title = chunk.item.metadata?.title ?? titleFromKey(key)
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

  const { query } = req.body as { query?: string }

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
      }),
    })

    if (response.ok) {
      const data = (await response.json()) as CFResponse
      const content = data.choices?.[0]?.message?.content
      if (content) {
        const answer = content.trim() + buildCitations(data.chunks ?? [])
        return res.status(200).json({ answer })
      }
    } else {
      console.error(`AI Search error (${response.status}):`, (await response.text()).slice(0, 200))
    }
  } catch (err) {
    console.error('AI Search fetch error:', err)
  }

  return res.status(200).json({
    answer: "Couldn't reach the search index — try browsing instead.",
    fallback: true,
  })
}
