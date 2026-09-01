import type { VercelRequest, VercelResponse } from '@vercel/node'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

// Try multiple model names for resilience
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
]

const SYSTEM_CONTEXT = `You are a subtle ambient agent on Oliver Newth's personal site (n3wth.com). You know the following about Oliver:

CAREER:
- Currently: AI Product Lead at Google. Builds platforms that put Google DeepMind models into products.
- Previously: Staff PM at Covariant (AI robotics, 50+ enterprise deployments, through Amazon's acquisition of the team). PM at Meta 2017-22 (video calling on Instagram and Portal; core growth and integrity; Build Social Value Award 2020). PM at Microsoft Azure (Cognitive Services, 100M+ API requests/day).
- Twelve years shipping AI products at scale. MIT MEng, High Performance Structures (Kennedy Scholar); Warwick Civil Engineering, First Class.

OPEN SOURCE:
- r3: Intelligent memory MCP for AI apps (TypeScript, Redis, vector embeddings)
- kit: AI-native component registry for design systems (49 components with AI context packs)
- hop.flights: Points-vs-cash flight optimizer
- skills: Markdown skills that teach AI assistants new tricks

CREATIVE:
- LED artist. Circle of Light (his World AIDS Day memorial, Golden Gate Park), lighting on THEM (30-foot Burning Man sculpture by Simon Malvaez), LED crew on the Twin Peaks Pink Triangle with Illuminate.

BELIEFS:
- "Trust Is a Runtime Property" -- production trust requires latency-aware safety classifiers, feedback loops not filters, and observability most teams never build.
- "AI Should Be Present, Not Summoned" -- the next generation of AI products will be ambient, not on-demand. Multi-agent coordination matters more than individual model capability. Transparency is the price of presence.
- Safety is a feature. Platforms over products. Observability is product. Ship the learning, not the model.

PERSONALITY:
- Lives in San Francisco (Corona Heights). Married to Edward. LGBTQ+ community.
- Direct, evidence-driven, minimal. Hates fluff and marketing language.

YOUR BEHAVIOR:
- You are NOT a chatbot. You are an ambient presence offering brief, insightful observations.
- Keep responses to 1-2 sentences. Maximum 40 words.
- Be specific, not generic. Reference actual projects, numbers, beliefs.
- Never use emojis. Never use exclamation marks. Never be sycophantic.
- If asked something you don't know, say so plainly.
- Suggest reaching out to Oliver directly: hey@n3wth.com`

// Intelligent fallback responses based on keywords
const FALLBACK_RESPONSES: Record<string, string> = {
  google: 'Oliver is an AI product lead at Google, building platforms that put DeepMind models into products.',
  work: 'Four companies, one thread: shipping AI from research to production. Google (DeepMind model platforms), Covariant (through Amazon\'s acquisition), Meta (video calling on Instagram and Portal), Microsoft (Azure Cognitive Services).',
  build: 'r3 gives AI apps persistent memory. kit ships design systems to AI coding tools. hop.flights finds the cheapest way to fly, miles or money. All open source.',
  creative: 'Circle of Light is his World AIDS Day memorial in Golden Gate Park. He built lighting on THEM at Burning Man and is on the Pink Triangle LED crew. Same systems thinking, different medium.',
  trust: 'Trust is a runtime property, not a benchmark score. Safety classifiers need to run at feature latency. Feedback loops beat filters. Most teams never build the observability to know.',
  agent: 'AI should be present, not summoned. The next generation of AI products will be ambient -- multi-agent systems where the coordination protocol matters more than any individual model.',
  contact: 'hey@n3wth.com -- AI safety, LED art, or coffee in San Francisco.',
  default: 'Oliver ships AI products at Google, builds open-source tools, and creates LED art installations. Ask about any of these, or reach out at hey@n3wth.com.',
}

function getFallbackReply(message: string): string {
  const lower = message.toLowerCase()
  for (const [key, reply] of Object.entries(FALLBACK_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return reply
  }
  return FALLBACK_RESPONSES.default
}

async function callGemini(message: string, context: string | undefined): Promise<string | null> {
  if (!GEMINI_API_KEY) return null

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_CONTEXT }] },
          contents: [
            {
              role: 'user',
              parts: [{ text: context ? `[User is currently viewing: ${context}]\n\n${message}` : message }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 100,
            temperature: 0.7,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) return text
      }

      const errText = await response.text()
      console.error(`Gemini ${model} error (${response.status}):`, errText.slice(0, 200))
    } catch (err) {
      console.error(`Gemini ${model} fetch error:`, err)
    }
  }

  return null
}

async function callOpenRouter(message: string, context: string | undefined): Promise<string | null> {
  if (!OPENROUTER_API_KEY) return null

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://n3wth.com',
        'X-Title': 'n3wth.com ambient agent',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-preview',
        max_tokens: 100,
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM_CONTEXT },
          { role: 'user', content: context ? `[User is currently viewing: ${context}]\n\n${message}` : message },
        ],
      }),
    })

    if (response.ok) {
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content
      if (text) return text
    }

    const errText = await response.text()
    console.error(`OpenRouter error (${response.status}):`, errText.slice(0, 200))
  } catch (err) {
    console.error('OpenRouter fetch error:', err)
  }

  return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS for same-origin
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, context } = req.body as { message?: string; context?: string }

  if (!message || typeof message !== 'string' || message.length > 500) {
    return res.status(400).json({ error: 'Invalid message' })
  }

  // Try Gemini first
  const geminiReply = await callGemini(message, context)
  if (geminiReply) {
    return res.status(200).json({ reply: geminiReply })
  }

  // Try OpenRouter as secondary LLM
  const openRouterReply = await callOpenRouter(message, context)
  if (openRouterReply) {
    return res.status(200).json({ reply: openRouterReply })
  }

  // Final fallback: keyword-based response
  const fallback = getFallbackReply(message)
  return res.status(200).json({ reply: fallback, fallback: true })
}
