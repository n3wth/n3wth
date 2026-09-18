import { NextRequest, NextResponse } from 'next/server'
import { tryGetDatabase } from '@/src/server/db/d1'
import { getAuth, getWorkerEnv, type SkillsWorkerEnv } from '@/src/server/auth/auth'

/**
 * Better Auth entry point for the Skills worker.
 * Mounted endpoints include:
 *   POST /api/auth/sign-in/magic-link
 *   GET  /api/auth/magic-link/verify
 *   POST /api/auth/sign-out
 *   GET  /api/auth/get-session
 */
async function handle(request: NextRequest): Promise<Response> {
  const db = await tryGetDatabase()
  if (!db) {
    return NextResponse.json({ error: 'Auth not configured (D1 binding DB missing)' }, { status: 503 })
  }
  const env = (await getWorkerEnv()) as SkillsWorkerEnv
  let auth
  try {
    auth = getAuth(db, env)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Auth not configured' },
      { status: 503 },
    )
  }
  return auth.handler(request)
}

export function GET(request: NextRequest) {
  return handle(request)
}

export function POST(request: NextRequest) {
  return handle(request)
}
