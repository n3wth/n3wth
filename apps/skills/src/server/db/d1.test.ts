// @vitest-environment node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { getPlatformProxy, type PlatformProxy } from 'wrangler'
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import {
  addAnonymousVote,
  addAuthenticatedVote,
  countVotes,
  createComment,
  getVotes,
  hasAnonymousVote,
  hasAuthenticatedVote,
  listComments,
  removeAnonymousVote,
  removeAuthenticatedVote,
} from '../repositories/community'
import {
  consumePlaygroundQuota,
  consumeWorkflowQuota,
  getAnalytics,
  getAnalyticsSummary,
  recordAnalytics,
} from '../repositories/usage'
import { createProfile, getProfile, updateProfile } from '../repositories/profiles'
import type { D1Database } from './d1'

const schema = readFileSync(resolve(process.cwd(), 'migrations/0002_app.sql'), 'utf8')

describe('D1 repositories with local Miniflare D1', () => {
  let db: D1Database
  let platform: PlatformProxy<{ DB: D1Database }>

  beforeEach(async () => {
    const tempRoot = await mkdtemp(resolve(tmpdir(), 'skills-d1-'))
    const configPath = resolve(tempRoot, 'wrangler.jsonc')
    await writeFile(configPath, JSON.stringify({
      name: 'skills-d1-test',
      compatibility_date: '2026-09-18',
      d1_databases: [{ binding: 'DB', database_name: 'skills-d1-test', database_id: 'skills-d1-test' }],
    }))
    // Wrangler's local platform proxy uses the transitively installed Miniflare runtime.
    platform = await getPlatformProxy({ configPath, persist: false })
    db = platform.env.DB
    await db.prepare('CREATE TABLE user (id TEXT PRIMARY KEY)').run()
    await db.batch(
      schema
        .split(/;\s*(?:\n|$)/)
        .map(statement => statement.trim())
        .filter(Boolean)
        .map(statement => db.prepare(statement)),
    )
    await db.prepare('INSERT INTO user (id) VALUES (?)').bind('user-1').run()
    await createProfile(db, { id: 'user-1', username: 'one' })
  })

  afterEach(async () => {
    await platform.dispose()
  })

  it('preserves ownership, idempotent votes, joined comments, and analytics', async () => {
    expect(await addAuthenticatedVote(db, 'user-1', 'skill-a')).toBe(1)
    expect(await addAuthenticatedVote(db, 'user-1', 'skill-a')).toBe(1)
    expect(await addAnonymousVote(db, 'fingerprint-a', 'skill-a')).toBe(2)
    await createComment(db, { userId: 'user-1', skillId: 'skill-a', body: 'hello' })
    expect((await listComments(db, 'skill-a'))[0]).toMatchObject({ body: 'hello', username: 'one' })
    await recordAnalytics(db, 'skill-a', 'view')
    await recordAnalytics(db, 'skill-a', 'copy')
    expect(await getAnalytics(db, 'skill-a')).toEqual([{ skill_id: 'skill-a', views: 1, copies: 1 }])
    expect(await getAnalyticsSummary(db, 'skill-a')).toEqual({ skill_id: 'skill-a', views: 1, copies: 1 })
    expect(await countVotes(db, 'skill-a')).toBe(2)
  })

  it('removes votes by actor and exposes both totals', async () => {
    await addAuthenticatedVote(db, 'user-1', 'skill-a')
    await addAnonymousVote(db, 'fingerprint-a', 'skill-a')
    expect(await getVotes(db, 'skill-a')).toEqual({
      authenticated: 1,
      anonymous: 1,
      total: 2,
    })
    expect(await hasAuthenticatedVote(db, 'user-1', 'skill-a')).toBe(true)
    expect(await hasAnonymousVote(db, 'fingerprint-a', 'skill-a')).toBe(true)
    expect(await removeAuthenticatedVote(db, 'user-1', 'skill-a')).toBe(1)
    expect(await removeAnonymousVote(db, 'fingerprint-a', 'skill-a')).toBe(0)
    expect(await getVotes(db, 'skill-a')).toEqual({
      authenticated: 0,
      anonymous: 0,
      total: 0,
    })
  })

  it('creates, reads, and updates profiles', async () => {
    await db.prepare('INSERT INTO user (id) VALUES (?)').bind('user-2').run()
    await createProfile(db, {
      id: 'user-2',
      username: 'two',
      display_name: 'User Two',
      github_url: 'https://github.com/two',
    })
    expect(await getProfile(db, 'user-2')).toMatchObject({
      id: 'user-2',
      username: 'two',
      display_name: 'User Two',
      role: 'user',
    })
    await updateProfile(db, 'user-2', {
      username: 'two-updated',
      display_name: 'Updated Two',
      avatar_url: null,
      bio: null,
      github_url: null,
      twitter_url: null,
      website_url: null,
    })
    expect(await getProfile(db, 'user-2')).toMatchObject({
      username: 'two-updated',
      display_name: 'Updated Two',
      avatar_url: null,
    })
  })

  it('returns Anonymous for comments without profiles and orders newest first', async () => {
    await db.prepare('INSERT INTO user (id) VALUES (?)').bind('user-3').run()
    await createComment(db, { userId: 'user-1', skillId: 'skill-a', body: 'older' })
    await createComment(db, { userId: 'user-3', skillId: 'skill-a', body: 'newer' })
    const comments = await listComments(db, 'skill-a')
    expect(comments.map(comment => comment.body)).toEqual(['newer', 'older'])
    expect(comments[0]).toMatchObject({ username: 'Anonymous' })
    expect(comments[1]).toMatchObject({ username: 'one' })
  })

  it('admits exactly three built-in quota uses and keeps workflow quota separate', async () => {
    const results = await Promise.all(Array.from({ length: 10 }, () => consumePlaygroundQuota(db, 'same', 3)))
    expect(results.filter(result => result.allowed)).toHaveLength(3)
    expect(Math.max(...results.map(result => result.used))).toBe(3)
    expect((await consumeWorkflowQuota(db, 'same', 3)).allowed).toBe(true)
  })
})
