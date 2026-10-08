import { skills } from '../../../src/data/skills'
import { tryGetDatabase } from '../../../src/server/db/d1'
import { getAnalytics, getAnalyticsSummary, recordAnalytics } from '../../../src/server/repositories/usage'

const validSkills = new Set(skills.map(skill => skill.id))

export async function GET(request: Request) {
  const db = await tryGetDatabase()
  if (!db) return Response.json({ error: 'Analytics storage not configured' }, { status: 503 })
  const skillId = new URL(request.url).searchParams.get('skillId')
  if (skillId) {
    const { views, copies } = await getAnalyticsSummary(db, skillId)
    return Response.json({ views, copies })
  }
  return Response.json((await getAnalytics(db)).filter(row => validSkills.has(row.skill_id)))
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body.skillId !== 'string' || !validSkills.has(body.skillId) || !['view', 'copy'].includes(body.eventType)) {
    return Response.json({ error: 'Valid skillId and eventType (view or copy) required' }, { status: 400 })
  }
  const db = await tryGetDatabase()
  if (!db) return Response.json({ error: 'Analytics storage not configured' }, { status: 503 })
  await recordAnalytics(db, body.skillId, body.eventType)
  return Response.json({ success: true })
}
