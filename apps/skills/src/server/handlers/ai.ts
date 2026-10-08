import { z } from 'zod'
import { getWorkerEnv } from '../auth/auth'
import { consumePlaygroundQuota, consumeWorkflowQuota } from '../repositories/usage'

const inputSchema = z.object({
  prompt: z.string().min(1).max(50000),
  fingerprint: z.string().min(1).max(256),
  userApiKey: z.string().max(512).optional(),
  skillContext: z.object({
    name: z.string().max(200), description: z.string().max(10000).optional(),
    features: z.array(z.string().max(2000)).max(50).optional(),
    useCases: z.array(z.string().max(2000)).max(50).optional(),
  }).optional(),
})
const model = 'gemini-3-flash-preview'

export async function executeAI(request: Request, kind: 'playground' | 'workflow') {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: 'Untrusted origin' }, { status: 403 })
  }
  const parsed = inputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Valid prompt and fingerprint required' }, { status: 400 })
  const { prompt, fingerprint, userApiKey, skillContext } = parsed.data
  const env = await getWorkerEnv()
  const apiKey = userApiKey || env.GEMINI_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) return Response.json({ error: 'AI service not configured' }, { status: 503 })
  let remaining: number | undefined
  try {
    if (!userApiKey) {
      if (!env.DB) return Response.json({ error: 'Usage storage not configured' }, { status: 503 })
      const quota = await (kind === 'playground' ? consumePlaygroundQuota : consumeWorkflowQuota)(env.DB, fingerprint)
      if (!quota.allowed) return Response.json({ error: 'Free run limit reached', limit: quota.limit, used: quota.used, message: 'Enter your own Gemini API key to continue.' }, { status: 402 })
      remaining = quota.remaining
    }
    const instruction = kind === 'workflow'
      ? 'You are an AI workflow executor. Generate useful output for each step.'
      : `You are a helpful AI assistant demonstrating this skill: ${JSON.stringify(skillContext ?? {})}`
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(60000),
      body: JSON.stringify({ contents: [{ parts: [{ text: `${instruction}\n\n${prompt}` }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 4096 } }),
    })
    if (!response.ok) {
      const invalidKey = response.status === 400 || response.status === 403
      return Response.json({ error: invalidKey ? 'Invalid API key' : 'AI service error' }, { status: invalidKey ? 401 : 502 })
    }
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
    return Response.json({ result: data.candidates?.[0]?.content?.parts?.map(part => part.text ?? '').join('') ?? '', remaining, model })
  } catch {
    return Response.json({ error: 'AI execution failed' }, { status: 502 })
  }
}
