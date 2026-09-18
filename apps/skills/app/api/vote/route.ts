import { NextRequest, NextResponse } from 'next/server'
import { tryGetDatabase } from '@/src/server/db/d1'
import { getAuth, getWorkerEnv, type SkillsWorkerEnv } from '@/src/server/auth/auth'
import { votesDelete, votesGet, votesPost } from '@/src/server/handlers/votes'

async function votesContext() {
  const env = (await getWorkerEnv()) as SkillsWorkerEnv
  const db = await tryGetDatabase()
  let auth = null
  if (db) {
    try {
      auth = getAuth(db, env)
    } catch {
      auth = null
    }
  }
  return { db, auth }
}

/** GET /api/vote?skillId=x - returns { count } (D1 + legacy Neon fallback) */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const skillId = searchParams.get('skillId')
  if (!skillId) {
    return NextResponse.json({ error: 'skillId required' }, { status: 400 })
  }
  return votesGet(skillId, await votesContext())
}

/** POST /api/vote - add vote. Auth session -> own upvote; anon -> fingerprint */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const skillId = searchParams.get('skillId')
  if (!skillId) {
    return NextResponse.json({ error: 'skillId required' }, { status: 400 })
  }
  return votesPost(skillId, request, await votesContext())
}

/** DELETE /api/vote - remove own vote (session) or anon fingerprint vote */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const skillId = searchParams.get('skillId')
  if (!skillId) {
    return NextResponse.json({ error: 'skillId required' }, { status: 400 })
  }
  return votesDelete(skillId, request, await votesContext())
}
