import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { skills } from '../../../src/data/skills'
import { getWorkerEnv } from '../../../src/server/auth/auth'

const recommendationSchema = z.object({
  recommendations: z.array(z.object({
    skillId: z.string(),
    reason: z.string().describe('Brief reason why this skill matches (10 words max)'),
  })).max(4),
})
const validSkills = new Set(skills.map(skill => skill.id))

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ recommendations: [] }, { status: 403 })
  }
  const body = await request.json().catch(() => null)
  const query = body?.query
  if (typeof query !== 'string' || query.trim().length < 3) {
    return Response.json({ recommendations: [] })
  }
  if (query.length > 2000) return Response.json({ recommendations: [] }, { status: 400 })
  const env = await getWorkerEnv()
  const apiKey = env.GOOGLE_GENERATIVE_AI_API_KEY || env.GEMINI_API_KEY
  if (!apiKey) return Response.json({ recommendations: [] }, { status: 503 })
  try {
    const google = createGoogleGenerativeAI({ apiKey })
    const { object } = await generateObject({
      model: google('gemini-3-flash-preview'),
      schema: recommendationSchema,
      abortSignal: AbortSignal.timeout(30000),
      prompt: `Recommend up to four relevant skills for the user's task from this catalog. Only use catalog IDs.\n${skills.map(skill => `${skill.id}: ${skill.name} (${skill.description}; ${skill.tags.join(', ')})`).join('\n')}\nUSER TASK: ${JSON.stringify(query)}`,
    })
    return Response.json({ recommendations: object.recommendations.filter(item => validSkills.has(item.skillId)) })
  } catch {
    return Response.json({ recommendations: [] }, { status: 502 })
  }
}
