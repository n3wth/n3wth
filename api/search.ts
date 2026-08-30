import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Retrieval-augmented answers over the site's own search index. The
 * palette does retrieval client-side (it already has the full index in
 * memory — pages, Thinking pieces, the kit, @n3wth/ui, garden notes) and
 * sends the top candidates here; this endpoint's only job is to turn
 * "here's what matched" into a written answer with real citations,
 * grounded strictly in what was sent — never guessing beyond it.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']

interface Candidate {
  title: string
  subtitle?: string
  href: string
}

const SYSTEM_PROMPT = `You answer questions about n3wth.com and its related properties (the garden, @n3wth/ui, agent skills) using ONLY the candidate list you're given below each question. Never use outside knowledge about Oliver Newth or these projects.

Rules:
- Ground every claim in the candidates. If they don't answer the question, say so plainly and suggest browsing instead of guessing.
- Cite what you use as markdown links: [Title](href), taken verbatim from the candidates.
- Two to four sentences. No preamble, no "Based on the candidates provided".
- No marketing language, no emoji, no exclamation marks.`

function buildPrompt(query: string, candidates: Candidate[]): string {
  const list = candidates
    .map((c, i) => `${i + 1}. ${c.title}${c.subtitle ? ` — ${c.subtitle}` : ''} (${c.href})`)
    .join('\n')
  return `Question: ${query}\n\nCandidates:\n${list || '(none matched)'}`
}

async function callGemini(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 220, temperature: 0.3 },
        }),
      })
      if (response.ok) {
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) return text
      } else {
        console.error(`Gemini ${model} error (${response.status}):`, (await response.text()).slice(0, 200))
      }
    } catch (err) {
      console.error(`Gemini ${model} fetch error:`, err)
    }
  }
  return null
}

async function callOpenRouter(prompt: string): Promise<string | null> {
  if (!OPENROUTER_API_KEY) return null
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://n3wth.com',
        'X-Title': 'n3wth.com search',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-preview',
        max_tokens: 220,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      }),
    })
    if (response.ok) {
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content
      if (text) return text
    } else {
      console.error(`OpenRouter error (${response.status}):`, (await response.text()).slice(0, 200))
    }
  } catch (err) {
    console.error('OpenRouter fetch error:', err)
  }
  return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { query, candidates } = req.body as { query?: string; candidates?: Candidate[] }

  if (!query || typeof query !== 'string' || query.length > 300) {
    return res.status(400).json({ error: 'Invalid query' })
  }
  const safeCandidates = Array.isArray(candidates)
    ? candidates
        .slice(0, 15)
        .filter((c): c is Candidate => typeof c?.title === 'string' && typeof c?.href === 'string')
        .map((c) => ({
          title: c.title.slice(0, 120),
          subtitle: typeof c.subtitle === 'string' ? c.subtitle.slice(0, 200) : undefined,
          href: c.href.slice(0, 300),
        }))
    : []

  const prompt = buildPrompt(query, safeCandidates)

  const answer = (await callGemini(prompt)) ?? (await callOpenRouter(prompt))
  if (answer) return res.status(200).json({ answer })

  return res.status(200).json({
    answer:
      safeCandidates.length > 0
        ? `Couldn't reach the answering service, but these matched: ${safeCandidates
            .slice(0, 5)
            .map((c) => `[${c.title}](${c.href})`)
            .join(', ')}.`
        : "Couldn't reach the answering service, and nothing matched that query either.",
    fallback: true,
  })
}
