// @vitest-environment node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { getPlatformProxy, type PlatformProxy } from 'wrangler'
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { createAuth, type Auth } from '../auth/auth'
import { getMagicLinkOutbox } from '../email/magic-link'
import { commentsDelete, commentsGet, commentsPost } from './comments'
import { votesDelete, votesGet, votesPost } from './votes'
import { createProfile } from '../repositories/profiles'
import type { D1Database } from '../db/d1'

const authSchema = readFileSync(resolve(process.cwd(), 'migrations/0001_better_auth.sql'), 'utf8')
const appSchema = readFileSync(resolve(process.cwd(), 'migrations/0002_app.sql'), 'utf8')

const BASE_URL = 'http://localhost:8787'
const TEST_SECRET = 'd1-auth-test-secret-0123456789abcdef'

function applySql(db: D1Database, sql: string) {
  return db.batch(
    sql.split(/;\s*(?:\n|$)/)
      .map(statement => statement.trim())
      .filter(Boolean)
      .map(statement => db.prepare(statement)),
  )
}

/** Full magic-link sign-in; returns the session cookie header value. */
async function signIn(auth: Auth, email: string): Promise<{ cookie: string; userId: string }> {
  await auth.handler(new Request(`${BASE_URL}/api/auth/sign-in/magic-link`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: BASE_URL, 'x-forwarded-for': '203.0.113.9' },
    body: JSON.stringify({ email, callbackURL: BASE_URL + '/' }),
  }))
  const message = [...getMagicLinkOutbox()].reverse().find(entry => entry.to === email)
  expect(message).toBeDefined()
  const verify = await auth.handler(new Request(message!.url))
  const setCookie = verify.headers.get('set-cookie')
  expect(setCookie).toBeTruthy()
  const pair = setCookie!.split(/,(?=[^;]+?=)/).map(part => part.trim().split(';')[0])
    .find(part => part.includes('.session_token=') && !part.endsWith('='))!
  const [name, value] = [pair.slice(0, pair.indexOf('=')), pair.slice(pair.indexOf('=') + 1)]
  const sessionResponse = await auth.handler(new Request(`${BASE_URL}/api/auth/get-session`, {
    headers: { cookie: `${name}=${value}` },
  }))
  const sessionBody = await sessionResponse.json() as { user: { id: string } }
  return { cookie: `${name}=${value}`, userId: sessionBody.user.id }
}

function commentPostRequest(skillId: string, body: string, cookie?: string, extra: Record<string, unknown> = {}) {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (cookie) headers.cookie = cookie
  return new Request(`${BASE_URL}/api/comments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ skillId, body, ...extra }),
  })
}

function voteRequest(url: string, method: 'POST' | 'DELETE', payload: Record<string, unknown>, cookie?: string) {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (cookie) headers.cookie = cookie
  return new Request(url, { method, headers, body: JSON.stringify(payload) })
}

describe('Route authorization rules replacing Supabase RLS (D1 + Better Auth session)', () => {
  let platform: PlatformProxy<{ DB: D1Database }>
  let db: D1Database
  let auth: Auth

  beforeEach(async () => {
    const tempRoot = await mkdtemp(resolve(tmpdir(), 'skills-d1-owner-'))
    const configPath = resolve(tempRoot, 'wrangler.jsonc')
    await writeFile(configPath, JSON.stringify({
      name: 'skills-d1-owner-test',
      compatibility_date: '2026-09-18',
      d1_databases: [{ binding: 'DB', database_name: 'skills-d1-owner-test', database_id: 'skills-d1-owner-test' }],
    }))
    platform = await getPlatformProxy({ configPath, persist: false })
    db = platform.env.DB as D1Database
    await applySql(db, authSchema)
    await applySql(db, appSchema)
    auth = createAuth(db, {
      BETTER_AUTH_SECRET: TEST_SECRET,
      BETTER_AUTH_URL: BASE_URL,
      MAGIC_LINK_OUTBOX: '1',
    })
  })

  afterEach(async () => {
    await platform.dispose()
  })

  it('comments: POST requires a session and the owner is always the session user', async () => {
    const anon = await commentsPost(commentPostRequest('skill-a', 'hello'), { db, auth })
    expect(anon.status).toBe(401)

    const { cookie, userId } = await signIn(auth, 'owner@example.com')
    // A hostile payload cannot smuggle a different user_id.
    const hostile = await commentsPost(
      commentPostRequest('skill-a', 'owned', cookie, { userId: 'someone-else', user_id: 'someone-else' }),
      { db, auth },
    )
    expect(hostile.status).toBe(200)
    const created = (await hostile.json() as { comment: { user_id: string; body: string } }).comment
    expect(created.user_id).toBe(userId)
    expect(created.body).toBe('owned')

    const listed = await commentsGet(db, 'skill-a')
    expect(listed).toHaveLength(1)
    expect(listed[0].user_id).toBe(userId)
  })

  it('comments: DELETE enforces owner check (403 for non-owner, 200 for owner)', async () => {
    const owner = await signIn(auth, 'comment-owner@example.com')
    const other = await signIn(auth, 'comment-other@example.com')
    await createProfile(db, { id: owner.userId, username: 'owner' })
    const created = await commentsPost(commentPostRequest('skill-a', 'mine', owner.cookie), { db, auth })
    const commentId = (await created.json() as { comment: { id: string } }).comment.id

    const wrongOwner = await commentsDelete(
      new Request(`${BASE_URL}/api/comments?id=${commentId}`, { method: 'DELETE', headers: { cookie: other.cookie } }),
      { db, auth },
    )
    expect(wrongOwner.status).toBe(403)
    expect((await commentsGet(db, 'skill-a'))).toHaveLength(1)

    const ok = await commentsDelete(
      new Request(`${BASE_URL}/api/comments?id=${commentId}`, { method: 'DELETE', headers: { cookie: owner.cookie } }),
      { db, auth },
    )
    expect(ok.status).toBe(200)
    expect((await commentsGet(db, 'skill-a'))).toHaveLength(0)

    const withoutAuth = await commentsDelete(
      new Request(`${BASE_URL}/api/comments?id=whatever`, { method: 'DELETE' }),
      { db, auth },
    )
    expect(withoutAuth.status).toBe(401)
  })

  it('votes: POST/DELETE operate only on the session user row; anon still uses fingerprint', async () => {
    const voter = await signIn(auth, 'voter@example.com')

    const posted = await votesPost('skill-a', voteRequest(`${BASE_URL}/api/vote`, 'POST', {}, voter.cookie), { db, auth })
    expect(posted.status).toBe(200)
    expect((await posted.json() as { count: number }).count).toBe(1)

    const rows = await db.prepare('SELECT user_id FROM upvotes').all<{ user_id: string }>()
    expect(rows.results.map(row => row.user_id)).toEqual([voter.userId])

    // Idempotent: same user voting again does not double-count.
    const again = await votesPost('skill-a', voteRequest(`${BASE_URL}/api/vote`, 'POST', {}, voter.cookie), { db, auth })
    expect((await again.json() as { count: number }).count).toBe(1)

    // Anonymous path needs fingerprint, writes to legacy-style votes table.
    const noFingerprint = await votesPost('skill-a', voteRequest(`${BASE_URL}/api/vote`, 'POST', {}), { db, auth })
    expect(noFingerprint.status).toBe(400)
    const anonVote = await votesPost('skill-a', voteRequest(`${BASE_URL}/api/vote`, 'POST', { fingerprint: 'fp-1' }), { db, auth })
    expect((await anonVote.json() as { count: number }).count).toBe(2)

    const getResponse = await votesGet('skill-a', { db, auth }, null)
    expect((await getResponse.json() as { count: number }).count).toBe(2)

    const undone = await votesDelete('skill-a', voteRequest(`${BASE_URL}/api/vote`, 'DELETE', {}, voter.cookie), { db, auth })
    expect((await undone.json() as { count: number }).count).toBe(1)
  })

  it('votes: a session cookie signed for one user cannot move another user vote', async () => {
    const first = await signIn(auth, 'first@example.com')
    const second = await signIn(auth, 'second@example.com')
    await votesPost('skill-a', voteRequest(`${BASE_URL}/api/vote`, 'POST', {}, first.cookie), { db, auth })

    const removeByOther = await votesDelete('skill-a', voteRequest(`${BASE_URL}/api/vote`, 'DELETE', {}, second.cookie), { db, auth })
    expect((await removeByOther.json() as { count: number }).count).toBe(1)
    const rows = await db.prepare('SELECT user_id FROM upvotes').all<{ user_id: string }>()
    expect(rows.results.map(row => row.user_id)).toEqual([first.userId])
  })
})
