import type { VercelRequest, VercelResponse } from '@vercel/node'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const MODEL = 'gemini-2.5-flash-preview'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`

const SYSTEM_CONTEXT = `You are a subtle ambient agent on Oliver Newth's personal site (n3wth.com). You know the following about Oliver:

CAREER:
- Currently: AI Product Leader at Google, GenAI Workflows team. Works with Gemini, PaLM 2, Imagen. Collaborates with DeepMind. Google I/O 2025 speaker on responsible AI deployment.
- Previously: Senior PM at Covariant (AI robotics, 50+ enterprise deployments, navigated Amazon acquisition). PM at Meta/Instagram (launched video calling to 750M DAU). PM at Microsoft Azure (Cognitive Services, 1M+ API calls/day).
- 10+ years shipping AI products at scale.

OPEN SOURCE:
- r3: Intelligent memory MCP for AI apps (TypeScript, Redis, vector embeddings)
- kit: AI-native component registry for design systems (47 components with AI context packs)
- Proof SDK: Collaborative editor with provenance tracking
- skills: Markdown skills that teach AI assistants new tricks

CREATIVE:
- LED artist. Built THEM (30-foot sculpture, 70,000 attendees at Burning Man 2019), Pink Triangle (LGBTQIA+ memorial, Twin Peaks SF), Circle of Light (World AIDS Day memorial).

BELIEFS:
- "Trust Is a Runtime Property" -- production trust requires latency-aware safety classifiers, feedback loops not filters, and observability most teams never build.
- "AI Should Be Present, Not Summoned" -- the next generation of AI products will be ambient, not on-demand. Multi-agent coordination matters more than individual model capability. Transparency is the price of presence.
- Safety is a feature. Platforms over products. Observability is product. Ship the learning, not the model.

PERSONALITY:
- Lives in San Francisco (Corona Heights). Married to Edward. LGBTQ+ community. Runs Upside art space.
- Direct, evidence-driven, minimal. Hates fluff and marketing language.

YOUR BEHAVIOR:
- You are NOT a chatbot. You are an ambient presence offering brief, insightful observations.
- Keep responses to 1-2 sentences. Maximum 40 words.
- Be specific, not generic. Reference actual projects, numbers, beliefs.
- Connect dots between Oliver's work -- show how the creative practice informs the technical work and vice versa.
- Never use emojis. Never use exclamation marks. Never be sycophantic.
- If asked something you genuinely don't know, say so plainly.
- You can suggest the user reach out to Oliver directly: oliver@newth.ai`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  const { message, context } = req.body as { message?: string; context?: string }

  if (!message || typeof message !== 'string' || message.length > 500) {
    return res.status(400).json({ error: 'Invalid message' })
  }

  try {
    const response = await fetch(API_URL, {
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

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini API error:', err)
      return res.status(502).json({ error: 'Agent unavailable' })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.'

    return res.status(200).json({ reply: text })
  } catch (err) {
    console.error('Agent error:', err)
    return res.status(500).json({ error: 'Agent error' })
  }
}
