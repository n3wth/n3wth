import type { D1Database } from '../db/d1'
import { newId, nowIso } from '../db/d1'

export interface Comment {
  id: string
  body: string
  created_at: string
  user_id: string
  username: string
  display_name: string | null
}

interface CommentRow {
  id: string
  body: string
  created_at: string
  user_id: string
  username: string | null
  display_name: string | null
}

export async function countVotes(db: D1Database, skillId: string): Promise<number> {
  const result = await db.batch([
    db.prepare('SELECT COUNT(*) AS count FROM upvotes WHERE skill_id = ?').bind(skillId),
    db.prepare('SELECT COUNT(*) AS count FROM votes WHERE skill_id = ?').bind(skillId),
  ])
  return Number(result[0]?.results?.[0]?.count ?? 0) + Number(result[1]?.results?.[0]?.count ?? 0)
}

export async function getVotes(db: D1Database, skillId: string): Promise<{ authenticated: number; anonymous: number; total: number }> {
  const result = await db.batch([
    db.prepare('SELECT COUNT(*) AS count FROM upvotes WHERE skill_id = ?').bind(skillId),
    db.prepare('SELECT COUNT(*) AS count FROM votes WHERE skill_id = ?').bind(skillId),
  ])
  const authenticated = Number(result[0]?.results?.[0]?.count ?? 0)
  const anonymous = Number(result[1]?.results?.[0]?.count ?? 0)
  return { authenticated, anonymous, total: authenticated + anonymous }
}

export async function listComments(db: D1Database, skillId: string): Promise<Comment[]> {
  const { results } = await db.prepare(`
    SELECT c.id, c.body, c.created_at, c.user_id, p.username, p.display_name
    FROM comments c LEFT JOIN profiles p ON p.id = c.user_id
    WHERE c.skill_id = ? ORDER BY c.created_at DESC
  `).bind(skillId).all<CommentRow>()
  return results.map(comment => ({
    ...comment,
    username: comment.username || 'Anonymous',
  }))
}

export async function createComment(
  db: D1Database,
  input: { userId: string; skillId: string; body: string; parentId?: string | null },
): Promise<Comment> {
  const id = newId()
  const createdAt = nowIso()
  await db.prepare(`
    INSERT INTO comments (id, user_id, skill_id, parent_id, body, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, input.userId, input.skillId, input.parentId ?? null, input.body.trim(), createdAt).run()
  const row = await db.prepare(`
    SELECT c.id, c.body, c.created_at, c.user_id, p.username, p.display_name
    FROM comments c LEFT JOIN profiles p ON p.id = c.user_id WHERE c.id = ?
  `).bind(id).first<CommentRow>()
  if (!row) throw new Error('Comment was not created')
  return { ...row, username: row.username || 'User' }
}

export async function addAuthenticatedVote(db: D1Database, userId: string, skillId: string): Promise<number> {
  await db.batch([
    db.prepare(`INSERT INTO upvotes (id, user_id, skill_id, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, skill_id) DO NOTHING`).bind(newId(), userId, skillId, nowIso()),
  ])
  return countVotes(db, skillId)
}

export async function removeAuthenticatedVote(db: D1Database, userId: string, skillId: string): Promise<number> {
  await db.prepare('DELETE FROM upvotes WHERE user_id = ? AND skill_id = ?').bind(userId, skillId).run()
  return countVotes(db, skillId)
}

export async function addAnonymousVote(db: D1Database, fingerprint: string, skillId: string): Promise<number> {
  const result = await db.batch([
    db.prepare(`INSERT INTO votes (skill_id, fingerprint, created_at) VALUES (?, ?, ?) ON CONFLICT(skill_id, fingerprint) DO NOTHING`).bind(skillId, fingerprint, nowIso()),
    db.prepare('SELECT COUNT(*) AS count FROM upvotes WHERE skill_id = ?').bind(skillId),
    db.prepare('SELECT COUNT(*) AS count FROM votes WHERE skill_id = ?').bind(skillId),
  ])
  return Number(result[1]?.results?.[0]?.count ?? 0) + Number(result[2]?.results?.[0]?.count ?? 0)
}

export async function removeAnonymousVote(db: D1Database, fingerprint: string, skillId: string): Promise<number> {
  await db.prepare('DELETE FROM votes WHERE skill_id = ? AND fingerprint = ?').bind(skillId, fingerprint).run()
  return countVotes(db, skillId)
}

export async function hasAuthenticatedVote(db: D1Database, userId: string, skillId: string): Promise<boolean> {
  return Boolean(await db.prepare('SELECT 1 AS present FROM upvotes WHERE user_id = ? AND skill_id = ?').bind(userId, skillId).first())
}

export async function hasAnonymousVote(db: D1Database, fingerprint: string, skillId: string): Promise<boolean> {
  return Boolean(await db.prepare('SELECT 1 AS present FROM votes WHERE fingerprint = ? AND skill_id = ?').bind(fingerprint, skillId).first())
}
