import type { D1Database } from '../db/d1'
import {
  addAnonymousVote,
  addAuthenticatedVote,
  countVotes,
  removeAnonymousVote,
  removeAuthenticatedVote,
} from '../repositories/community'
import type { Auth } from '../auth/auth'

/**
 * Route logic for /api/vote, separated from Next request plumbing so the
 * authorization rules (former Supabase RLS) are unit-testable:
 * - Anyone can read vote counts (was: policy "Anyone can read upvote counts")
 * - Authenticated users insert/delete ONLY their own upvote row
 *   (was: auth.uid() = user_id); the client cannot choose user_id.
 * - Anonymous votes remain fingerprinted rows in the legacy `votes` table.
 */

export interface VotesContext {
  db: D1Database | null
  auth: Auth | null
}

/** Legacy Neon fallback for GET counts while Neon remains the fallback store. */
export type LegacyVoteCounter = ((skillId: string) => Promise<number>) | null

async function legacyNeonVoteCount(skillId: string): Promise<number> {
  const hasDb =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.SKILLS_POSTGRES_URL
  if (!hasDb) return 0
  try {
    const { sql } = await import('../../../api/_lib/db')
    const result = await sql`SELECT COUNT(*) as count FROM votes WHERE skill_id = ${skillId}`
    return parseInt(String(result[0]?.count ?? 0), 10)
  } catch {
    return 0
  }
}

async function sessionUserId(auth: Auth | null, headers: Headers): Promise<string | null> {
  if (!auth) return null
  const session = await auth.api.getSession({ headers })
  return session?.user.id ?? null
}

export async function votesGet(skillId: string, ctx: VotesContext, legacyCount?: LegacyVoteCounter): Promise<Response> {
  if (!ctx.db) {
    // Pre-migration behavior: anonymous-only fallback path.
    const counter = legacyCount === undefined ? legacyNeonVoteCount : legacyCount
    const legacy = counter ? await counter(skillId) : 0
    return Response.json({ count: legacy })
  }
  const total = await countVotes(ctx.db, skillId)
  const counter = legacyCount === undefined ? legacyNeonVoteCount : legacyCount
  const legacy = counter ? await counter(skillId) : 0
  return Response.json({ count: total + legacy })
}

export async function votesPost(skillId: string, request: Request, ctx: VotesContext): Promise<Response> {
  if (!ctx.db) {
    return Response.json({ error: 'Vote storage not configured' }, { status: 503 })
  }
  const userId = await sessionUserId(ctx.auth, request.headers)
  if (userId) {
    const count = await addAuthenticatedVote(ctx.db, userId, skillId)
    return Response.json({ count })
  }
  const body = (await request.json().catch(() => ({}))) as { fingerprint?: unknown }
  const fingerprint = typeof body.fingerprint === 'string' ? body.fingerprint : ''
  if (!fingerprint) {
    return Response.json({ error: 'fingerprint required when not authenticated' }, { status: 400 })
  }
  const count = await addAnonymousVote(ctx.db, fingerprint, skillId)
  return Response.json({ count })
}

export async function votesDelete(skillId: string, request: Request, ctx: VotesContext): Promise<Response> {
  if (!ctx.db) {
    return Response.json({ error: 'Vote storage not configured' }, { status: 503 })
  }
  const userId = await sessionUserId(ctx.auth, request.headers)
  if (userId) {
    const count = await removeAuthenticatedVote(ctx.db, userId, skillId)
    return Response.json({ count })
  }
  const body = (await request.json().catch(() => ({}))) as { fingerprint?: unknown }
  const fingerprint = typeof body.fingerprint === 'string' ? body.fingerprint : ''
  if (!fingerprint) {
    return Response.json({ error: 'fingerprint required when not authenticated' }, { status: 400 })
  }
  const count = await removeAnonymousVote(ctx.db, fingerprint, skillId)
  return Response.json({ count })
}
