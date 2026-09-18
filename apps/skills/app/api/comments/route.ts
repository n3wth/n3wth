import { NextRequest, NextResponse } from 'next/server'
import { tryGetDatabase } from '@/src/server/db/d1'
import { getAuth, getWorkerEnv, type SkillsWorkerEnv } from '@/src/server/auth/auth'
import { commentsDelete, commentsGet, commentsPost } from '@/src/server/handlers/comments'

async function commentsContext() {
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

/** GET /api/comments?skillId=x - list comments for a skill (flat, newest first) */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const skillId = searchParams.get('skillId')
  if (!skillId) {
    return NextResponse.json({ error: 'skillId required' }, { status: 400 })
  }
  const ctx = await commentsContext()
  if (!ctx.db) {
    return NextResponse.json({ comments: [] })
  }
  const comments = await commentsGet(ctx.db, skillId)
  return NextResponse.json({ comments })
}

/** POST /api/comments - create comment (auth required; owner = session user) */
export async function POST(request: NextRequest) {
  return commentsPost(request, await commentsContext())
}

/** DELETE /api/comments?id=x - delete own comment (auth required) */
export async function DELETE(request: NextRequest) {
  return commentsDelete(request, await commentsContext())
}
