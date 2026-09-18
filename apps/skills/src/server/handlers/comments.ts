import type { D1Database } from '../db/d1'
import { createComment, deleteComment, getCommentOwner, listComments } from '../repositories/community'
import type { Auth } from '../auth/auth'

/**
 * Route logic for /api/comments, separated from Next request plumbing so the
 * authorization rules (former Supabase RLS) are unit-testable:
 * - Anyone can read comments (was: policy "Anyone can read comments")
 * - Authenticated users can insert their own comment (was: auth.uid() = user_id)
 * - Users can delete their own comment (was: policy "Users can delete own comment")
 */

export interface CommentsContext {
  db: D1Database | null
  auth: Auth | null
}

type JsonBody = Record<string, unknown>

export function commentsGet(db: D1Database, skillId: string) {
  return listComments(db, skillId)
}

interface SessionUser {
  id: string
  email?: string
  name?: string
}

async function requireUser(ctx: CommentsContext, headers: Headers): Promise<{ user: SessionUser } | { error: Response }> {
  if (!ctx.auth) {
    return {
      error: Response.json({ error: 'Auth not configured' }, { status: 503 }),
    }
  }
  const session = await ctx.auth.api.getSession({ headers })
  if (!session) {
    return {
      error: Response.json({ error: 'Sign in to comment' }, { status: 401 }),
    }
  }
  return { user: session.user }
}

export async function commentsPost(request: Request, ctx: CommentsContext): Promise<Response> {
  if (!ctx.db) {
    return Response.json({ error: 'Comment storage not configured' }, { status: 503 })
  }
  const authResult = await requireUser(ctx, request.headers)
  if ('error' in authResult) return authResult.error

  const body = (await request.json().catch(() => ({}))) as JsonBody
  const skillId = typeof body.skillId === 'string' ? body.skillId : undefined
  const commentBody = typeof body.body === 'string' ? body.body : undefined
  const parentId = typeof body.parentId === 'string' ? body.parentId : null
  if (!skillId || !commentBody?.trim()) {
    return Response.json({ error: 'skillId and body required' }, { status: 400 })
  }

  // Owner is always the session user; the payload cannot set user_id.
  const comment = await createComment(ctx.db, {
    userId: authResult.user.id,
    skillId,
    body: commentBody,
    parentId,
  })
  return Response.json({ comment })
}

export async function commentsDelete(request: Request, ctx: CommentsContext): Promise<Response> {
  if (!ctx.db) {
    return Response.json({ error: 'Comment storage not configured' }, { status: 503 })
  }
  const authResult = await requireUser(ctx, request.headers)
  if ('error' in authResult) return authResult.error

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) {
    return Response.json({ error: 'id required' }, { status: 400 })
  }

  const owner = await getCommentOwner(ctx.db, id)
  if (!owner) {
    return Response.json({ error: 'Comment not found' }, { status: 404 })
  }
  if (owner.user_id !== authResult.user.id) {
    return Response.json({ error: 'You can only delete your own comments' }, { status: 403 })
  }
  await deleteComment(ctx.db, id)
  return Response.json({ ok: true })
}
