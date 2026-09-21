import { handleSubscribe, type SubscribeEnv } from './subscribe'

interface RuntimeEnv extends SubscribeEnv {
  GEMINI_API_KEY?: string
  OPENROUTER_API_KEY?: string
  GITHUB_TOKEN?: string
}
type FetchImplementation = typeof fetch

const AI_SEARCH_ENDPOINT =
  'https://ns-5d811e45-2200-4a51-815d-66292af832dd.search.ai.cloudflare.com/chat/completions'

const SYSTEM_PROMPT = `You answer questions about n3wth.com and its related properties (the garden, @n3wth/ui) using ONLY the retrieved context. Never use outside knowledge about Oliver Newth or these projects.

Rules:
- Ground every claim in the retrieved context. If it doesn't answer the question, say so plainly and suggest browsing instead of guessing.
- Two to four sentences. No preamble, no "Based on the provided context".
- No marketing language, no emoji, no exclamation marks.
- Do not fabricate links yourself — citations are added separately.`

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']

const SYSTEM_CONTEXT = `You are a subtle ambient agent on Oliver Newth's personal site (n3wth.com). You know the following about Oliver:

CAREER:
- Currently: AI Product Lead at Google. Builds platforms that put Google DeepMind models into products.
- Previously: Staff PM at Covariant (AI robotics, 50+ enterprise deployments, through Amazon's acquisition of the team). PM at Meta 2017-22 (video calling on Instagram and Portal; core growth and integrity; Build Social Value Award 2020). PM at Microsoft Azure (Cognitive Services, 100M+ API requests/day).
- Twelve years shipping AI products at scale. MIT MEng, High Performance Structures (Kennedy Scholar); Warwick Civil Engineering, First Class.

OPEN SOURCE:
- r3: Intelligent memory MCP for AI apps (TypeScript, Redis, vector embeddings)
- kit: AI-native component registry for design systems (49 components with AI context packs)
- hop.flights: Points-vs-cash flight optimizer
- lunchmoney.sh: Unofficial Lunch Money MCP plugin for Claude, Codex, and Cursor (read-only)
- skills: Markdown skills that teach AI assistants new tricks

CREATIVE:
- LED artist. THEM — Lighting and Circle of Light ring. Design: Simón Malvaez. Fabrication: Brenden Blaine Darby. Fractured Atlas. Black Rock City, Nevada, 2022. Pink Triangle — Project coordination as part of Illuminate on Patrick Carney’s Pride memorial. Twin Peaks, San Francisco, 2022. Circle of Light — World AIDS Day memorial for the National AIDS Memorial. AIDS Memorial Grove, San Francisco, 2021.

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

const FALLBACK_RESPONSES: Record<string, string> = {
  google: 'Oliver is an AI product lead at Google, building platforms that put DeepMind models into products.',
  work: 'Four companies, one thread: shipping AI from research to production. Google (DeepMind model platforms), Covariant (through Amazon\'s acquisition), Meta (video calling on Instagram and Portal), Microsoft (Azure Cognitive Services).',
  build: 'r3 gives AI apps persistent memory. kit ships design systems to AI coding tools. hop.flights finds the cheapest way to fly, miles or money. All open source.',
  lunch: 'lunchmoney.sh is an unofficial Lunch Money plugin for Claude, Codex, and Cursor. Read-only spending, budgets, and bills.',
  creative: 'Circle of Light is his World AIDS Day memorial for the National AIDS Memorial, in the AIDS Memorial Grove (2021). On THEM he did the lighting and the Circle of Light ring, design by Simón Malvaez and fabrication by Brenden Blaine Darby (2022). Pink Triangle was project coordination as part of Illuminate (2022).',
  trust: 'Trust is a runtime property, not a benchmark score. Safety classifiers need to run at feature latency. Feedback loops beat filters. Most teams never build the observability to know.',
  agent: 'AI should be present, not summoned. The next generation of AI products will be ambient -- multi-agent systems where the coordination protocol matters more than any individual model.',
  contact: 'hey@n3wth.com -- AI safety, LED art, or coffee in San Francisco.',
  default: 'Oliver ships AI products at Google, builds open-source tools, and creates LED art installations. Ask about any of these, or reach out at hey@n3wth.com.',
}

interface SearchChunk {
  item?: { key?: string; metadata?: { title?: string } }
}

function corsHeaders(): Headers {
  return new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
}

function json(body: unknown, status = 200, cors = false): Response {
  const headers = cors ? corsHeaders() : new Headers()
  headers.set('Content-Type', 'application/json; charset=utf-8')
  return new Response(JSON.stringify(body), { status, headers })
}

function fallbackReply(message: string): string {
  const lower = message.toLowerCase()
  for (const [key, reply] of Object.entries(FALLBACK_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return reply
  }
  return FALLBACK_RESPONSES.default
}

function decodeEntities(text: string): string {
  const entities: Record<string, string> = { '&quot;': '"', '&#39;': "'", '&amp;': '&', '&lt;': '<', '&gt;': '>' }
  return text.replace(/&quot;|&#39;|&amp;|&lt;|&gt;/g, (match) => entities[match])
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

function citations(chunks: SearchChunk[]): string {
  const seen = new Set<string>()
  const links: string[] = []
  for (const chunk of chunks) {
    const key = chunk.item?.key
    if (!key || seen.has(key)) continue
    seen.add(key)
    const title = decodeEntities(chunk.item?.metadata?.title ?? titleFromKey(key))
    links.push(`[${title}](${key})`)
    if (links.length >= 4) break
  }
  return links.length ? ` Sources: ${links.join(', ')}.` : ''
}

function streamSearch(upstream: Response, responseHeaders: Headers): Response {
  const reader = upstream.body?.getReader()
  if (!reader) return json({ answer: "Couldn't reach the search index — try browsing instead.", fallback: true }, 200, true)
  let clientCanceled = false
  let released = false
  const cancelReader = async (reason?: unknown): Promise<void> => {
    if (released) return
    try {
      await reader.cancel(reason)
    } catch {
      // The upstream reader may already be closed or errored.
    } finally {
      released = true
      reader.releaseLock()
    }
  }
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const stream = new ReadableStream({
    async start(controller) {
      let buffer = ''
      let currentEvent = ''
      let chunks: SearchChunk[] = []
      let content = ''
      const emit = (value: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(value)}\n\n`))
      const emitDone = () => controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      const processLine = (line: string) => {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim()
          return
        }
        if (!line.startsWith('data: ')) return
        const data = line.slice(6)
        if (data === '[DONE]') {
          const sourceText = citations(chunks)
          if (sourceText) emit({ delta: sourceText })
          emitDone()
          return
        }
        try {
          if (currentEvent === 'chunks') {
            chunks = JSON.parse(data) as SearchChunk[]
          } else {
            const delta = (JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> }).choices?.[0]?.delta?.content
            if (delta) {
              content += delta
              emit({ delta })
            }
          }
        } catch {
          // Ignore malformed upstream events, matching the Vercel handler.
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
          lines.forEach(processLine)
        }
        if (buffer) processLine(buffer)
        if (!content) {
          emit({ delta: "Couldn't generate an answer — try browsing instead." })
          emitDone()
        }
        controller.close()
      } catch (error) {
        await cancelReader(error)
        if (clientCanceled) return
        if (!content) emit({ delta: "Couldn't generate an answer — try browsing instead." })
        emitDone()
        controller.close()
      } finally {
        if (!released) {
          released = true
          reader.releaseLock()
        }
      }
    },
    cancel(reason) {
      clientCanceled = true
      return cancelReader(reason)
    },
  })
  responseHeaders.set('Content-Type', 'text/event-stream')
  responseHeaders.set('Cache-Control', 'no-cache')
  responseHeaders.set('Connection', 'keep-alive')
  return new Response(stream, { status: 200, headers: responseHeaders })
}

async function agent(request: Request, env: RuntimeEnv, fetchImpl: FetchImplementation): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders() })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, true)
  const body = await request.json().catch(() => ({})) as { message?: string; context?: string }
  if (!body.message || typeof body.message !== 'string' || body.message.length > 500) return json({ error: 'Invalid message' }, 400, true)
  const callGemini = async (): Promise<string | null> => {
    if (!env.GEMINI_API_KEY) return null
    for (const model of MODELS) {
      try {
        const response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM_CONTEXT }] }, contents: [{ role: 'user', parts: [{ text: body.context ? `[User is currently viewing: ${body.context}]\n\n${body.message}` : body.message }] }], generationConfig: { maxOutputTokens: 100, temperature: 0.7 } }) })
        if (response.ok) {
          const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) return text
        }
      } catch {
        // Try the next configured provider/model.
      }
    }
    return null
  }
  const callOpenRouter = async (): Promise<string | null> => {
    if (!env.OPENROUTER_API_KEY) return null
    try {
      const response = await fetchImpl('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENROUTER_API_KEY}`, 'HTTP-Referer': 'https://n3wth.com', 'X-Title': 'n3wth.com ambient agent' }, body: JSON.stringify({ model: 'google/gemini-2.5-flash-preview', max_tokens: 100, temperature: 0.7, messages: [{ role: 'system', content: SYSTEM_CONTEXT }, { role: 'user', content: body.context ? `[User is currently viewing: ${body.context}]\n\n${body.message}` : body.message }] }) })
      if (response.ok) return ((await response.json()) as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content ?? null
    } catch {
      // Fall back to the deterministic response.
    }
    return null
  }
  const reply = await callGemini() ?? await callOpenRouter()
  return json(reply ? { reply } : { reply: fallbackReply(body.message), fallback: true }, 200, true)
}

async function search(request: Request, fetchImpl: FetchImplementation): Promise<Response> {
  const cors = corsHeaders()
  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, true)
  const body = await request.json().catch(() => ({})) as { query?: string; stream?: boolean }
  if (!body.query || typeof body.query !== 'string' || body.query.length > 300) return json({ error: 'Invalid query' }, 400, true)
  try {
    const upstream = await fetchImpl(AI_SEARCH_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: body.query }], max_tokens: 180, temperature: 0.3, stream: Boolean(body.stream) }) })
    if (!upstream.ok) return json({ answer: "Couldn't reach the search index — try browsing instead.", fallback: true }, 200, true)
    if (body.stream && upstream.body) return streamSearch(upstream, cors)
    const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }>; chunks?: SearchChunk[] }
    const content = data.choices?.[0]?.message?.content
    return content ? json({ answer: content.trim() + citations(data.chunks ?? []) }, 200, true) : json({ answer: "Couldn't reach the search index — try browsing instead.", fallback: true }, 200, true)
  } catch {
    return json({ answer: "Couldn't reach the search index — try browsing instead.", fallback: true }, 200, true)
  }
}

async function githubStats(request: Request, env: RuntimeEnv, fetchImpl: FetchImplementation): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405)
  const url = new URL(request.url)
  const owner = url.searchParams.get('owner')
  const repo = url.searchParams.get('repo')
  if (!owner || !repo || url.searchParams.getAll('owner').length !== 1 || url.searchParams.getAll('repo').length !== 1) return json({ error: 'Missing owner or repo' }, 400)
  try {
    const response = await fetchImpl(`https://api.github.com/repos/${owner}/${repo}`, { headers: { Accept: 'application/vnd.github.v3+json', ...(env.GITHUB_TOKEN ? { Authorization: `token ${env.GITHUB_TOKEN}` } : {}) } })
    if (!response.ok) return json({ error: 'GitHub API error' }, response.status)
    const data = await response.json() as { stargazers_count?: number; forks_count?: number }
    return json({ stars: data.stargazers_count, forks: data.forks_count })
  } catch {
    return json({ error: 'Internal server error' }, 500)
  }
}

export async function handlePortfolioApi(request: Request, env: RuntimeEnv = {}, fetchImpl: FetchImplementation = fetch): Promise<Response | undefined> {
  const path = new URL(request.url).pathname.replace(/\/$/, '')
  if (path === '/api/agent') return agent(request, env, fetchImpl)
  if (path === '/api/search') return search(request, fetchImpl)
  if (path === '/api/github-stats') return githubStats(request, env, fetchImpl)
  if (path === '/api/subscribe') return handleSubscribe(request, env, fetchImpl)
  return undefined
}

export async function handleVercelRequest(req: { method?: string; url?: string; headers: Record<string, string | string[] | undefined>; body?: unknown }, res: { setHeader(name: string, value: string): void; status(code: number): { json(body: unknown): unknown; end(): unknown; send(body: string): unknown }; write(chunk: Uint8Array): void; end(): void }): Promise<void> {
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) if (typeof value === 'string') headers.set(key, value)
  const method = req.method ?? 'GET'
  const request = new Request(`https://${headers.get('host') ?? 'n3wth.com'}${req.url ?? '/'}`, { method, headers, body: method === 'GET' || method === 'HEAD' ? undefined : JSON.stringify(req.body ?? {}) })
  const response = await handlePortfolioApi(request, process.env as RuntimeEnv)
  if (!response) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  response.headers.forEach((value, key) => res.setHeader(key, value))
  const status = res.status(response.status)
  if (response.headers.get('content-type')?.startsWith('text/event-stream') && response.body) {
    const reader = response.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(value)
    }
    res.end()
    return
  }
  status.send(await response.text())
}
