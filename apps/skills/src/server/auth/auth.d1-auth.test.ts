// @vitest-environment node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { getPlatformProxy, type PlatformProxy } from 'wrangler'
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { createAuth, type Auth } from './auth'
import { getMagicLinkOutbox } from '../email/magic-link'
import type { D1Database } from '../db/d1'

const authSchema = readFileSync(resolve(process.cwd(), 'migrations/0001_better_auth.sql'), 'utf8')
const appSchema = readFileSync(resolve(process.cwd(), 'migrations/0002_app.sql'), 'utf8')

const BASE_URL = 'http://localhost:8787'
const TEST_SECRET = 'd1-auth-test-secret-0123456789abcdef'
const FIXED_UUID = 'c0ffee00-0000-4000-8000-0000000000aa'

function applySql(db: D1Database, sql: string) {
  return db.batch(
    sql.split(/;\s*(?:\n|$)/)
      .map(statement => statement.trim())
      .filter(Boolean)
      .map(statement => db.prepare(statement)),
  )
}

async function createTestContext() {
  const tempRoot = await mkdtemp(resolve(tmpdir(), 'skills-d1-auth-'))
  const configPath = resolve(tempRoot, 'wrangler.jsonc')
  await writeFile(configPath, JSON.stringify({
    name: 'skills-d1-auth-test',
    compatibility_date: '2026-09-18',
    d1_databases: [{ binding: 'DB', database_name: 'skills-d1-auth-test', database_id: 'skills-d1-auth-test' }],
  }))
  const platform = await getPlatformProxy<{ DB: D1Database }>({ configPath, persist: false })
  const db = platform.env.DB
  await applySql(db, authSchema)
  await applySql(db, appSchema)
  const env = {
    BETTER_AUTH_SECRET: TEST_SECRET,
    BETTER_AUTH_URL: BASE_URL,
    MAGIC_LINK_OUTBOX: '1',
  }
  return { platform, db, env }
}

async function requestMagicLink(auth: Auth, email: string, overrides: { callbackURL?: string; origin?: string | null; ip?: string } = {}) {
  const headers = new Headers({ 'content-type': 'application/json' })
  if (overrides.origin !== null) headers.set('origin', overrides.origin ?? BASE_URL)
  headers.set('x-forwarded-for', overrides.ip ?? '198.51.100.23')
  return auth.handler(new Request(`${BASE_URL}/api/auth/sign-in/magic-link`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, ...(overrides.callbackURL ? { callbackURL: overrides.callbackURL } : { callbackURL: BASE_URL + '/' }) }),
  }))
}

function sessionCookieFrom(setCookie: string | null): { name: string; value: string } | null {
  if (!setCookie) return null
  for (const part of setCookie.split(/,(?=[^;]+?=)/)) {
    const [pair] = part.trim().split(';')
    const eq = pair.indexOf('=')
    const name = pair.slice(0, eq)
    const value = pair.slice(eq + 1)
    if (name.endsWith('.session_token') && value) return { name, value }
  }
  return null
}

async function verifyMagicLink(auth: Auth, url: string) {
  return auth.handler(new Request(url, { method: 'GET' }))
}

describe('Better Auth on D1 (local Miniflare binding)', () => {
  let ctx: { platform: PlatformProxy<{ DB: D1Database }>; db: D1Database; env: Record<string, string> }
  let auth: Auth

  beforeEach(async () => {
    ctx = await createTestContext()
    auth = createAuth(ctx.db, ctx.env)
  })

  afterEach(async () => {
    await ctx.platform.dispose()
  })

  it('issues a magic-link, redeems it once, rejects replay, and signs out', async () => {
    const email = 'user@example.com'
    const requestResponse = await requestMagicLink(auth, email)
    expect(requestResponse.status).toBe(200)

    const outbox = getMagicLinkOutbox()
    const message = [...outbox].reverse().find(entry => entry.to === email)
    expect(message).toBeDefined()
    expect(message!.url).toContain(`${BASE_URL}/api/auth/magic-link/verify`)
    expect(message!.url).toContain(`token=`)

    // First redemption mints a session.
    const verifyResponse = await verifyMagicLink(auth, message!.url)
    expect(verifyResponse.status).toBe(302)
    const cookie = sessionCookieFrom(verifyResponse.headers.get('set-cookie'))
    expect(cookie).not.toBeNull()

    const sessionResponse = await auth.handler(new Request(`${BASE_URL}/api/auth/get-session`, {
      headers: { cookie: `${cookie!.name}=${cookie!.value}` },
    }))
    expect(sessionResponse.status).toBe(200)
    const sessionBody = await sessionResponse.json() as { user?: { email?: string } } | null
    expect(sessionBody?.user?.email).toBe(email)

    // Replay of the same link is rejected and mints no session.
    const replayResponse = await verifyMagicLink(auth, message!.url)
    const replayLocation = replayResponse.headers.get('location') ?? ''
    expect(replayLocation).toContain('error=INVALID_TOKEN')
    expect(sessionCookieFrom(replayResponse.headers.get('set-cookie'))).toBeNull()

    // Sign out kills the session server-side.
    const signOutResponse = await auth.handler(new Request(`${BASE_URL}/api/auth/sign-out`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: BASE_URL,
        cookie: `${cookie!.name}=${cookie!.value}`,
      },
      body: '{}',
    }))
    expect(signOutResponse.status).toBe(200)

    const postSignOutSession = await auth.handler(new Request(`${BASE_URL}/api/auth/get-session`, {
      headers: { cookie: `${cookie!.name}=${cookie!.value}` },
    }))
    const postBody = await postSignOutSession.json().catch(() => undefined)
    expect(postBody ?? null).toBeNull()
  })

  it('rejects hostile origins at verify time and on cookie-carrying POSTs', async () => {
    // Cookie-bearing POST from an untrusted Origin is refused (CSRF check).
    const signedIn = await requestMagicLink(auth, 'csrf-victim@example.com')
    expect(signedIn.status).toBe(200)
    const firstMessage = [...getMagicLinkOutbox()].reverse().find(entry => entry.to === 'csrf-victim@example.com')
    const firstVerify = await verifyMagicLink(auth, firstMessage!.url)
    const cookie = sessionCookieFrom(firstVerify.headers.get('set-cookie'))
    expect(cookie).not.toBeNull()
    const hostileCsrf = await auth.handler(new Request(`${BASE_URL}/api/auth/sign-out`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://evil.example',
        cookie: `${cookie!.name}=${cookie!.value}`,
      },
      body: '{}',
    }))
    expect(hostileCsrf.status).toBe(403)

    // A sign-in request carrying an untrusted callbackURL is rejected up
    // front — no link is issued at all.
    const issued = await requestMagicLink(auth, 'cb-attack@example.com', { callbackURL: 'https://evil.example/phish' })
    expect(issued.status).toBe(403)
    expect(getMagicLinkOutbox().some(entry => entry.to === 'cb-attack@example.com')).toBe(false)

    // Defense in depth: even a hand-crafted verify URL with an untrusted
    // callback is refused and never mints a session or redirects off-origin.
    await requestMagicLink(auth, 'cb-attack2@example.com')
    const goodMessage = [...getMagicLinkOutbox()].reverse().find(entry => entry.to === 'cb-attack2@example.com')
    expect(goodMessage).toBeDefined()
    const tampered = goodMessage!.url.replace(encodeURIComponent(BASE_URL + '/'), encodeURIComponent('https://evil.example/phish'))
    expect(tampered).not.toBe(goodMessage!.url)
    const verify = await verifyMagicLink(auth, tampered)
    expect(verify.status).toBe(403)
    expect(sessionCookieFrom(verify.headers.get('set-cookie'))).toBeNull()
    expect(verify.headers.get('location') ?? '').not.toContain('evil.example')
  })

  it('preserves imported fixed UUIDs through magic-link sign-in', async () => {
    const email = 'imported@example.com'
    const now = new Date().toISOString()
    // Simulated import: fixed UUID user row written directly to D1.
    await ctx.db.prepare(
      'INSERT INTO user (id, name, email, emailVerified, image, createdAt, updatedAt) VALUES (?, ?, ?, ?, NULL, ?, ?)',
    ).bind(FIXED_UUID, 'Imported User', email, 0, now, now).run()

    await requestMagicLink(auth, email)
    const message = [...getMagicLinkOutbox()].reverse().find(entry => entry.to === email)
    const verifyResponse = await verifyMagicLink(auth, message!.url)
    const cookie = sessionCookieFrom(verifyResponse.headers.get('set-cookie'))
    expect(cookie).not.toBeNull()

    const sessionResponse = await auth.handler(new Request(`${BASE_URL}/api/auth/get-session`, {
      headers: { cookie: `${cookie!.name}=${cookie!.value}` },
    }))
    const body = await sessionResponse.json() as { user?: { id?: string } } | null
    expect(body?.user?.id).toBe(FIXED_UUID)
  })

  it('persists rate limits in D1 across auth instances', async () => {
    // magic-link default rule: 5 requests per 60s; storage "database" keeps
    // counters in the rateLimit table, so limits survive isolate restarts.
    for (let i = 0; i < 5; i++) {
      const response = await requestMagicLink(auth, `burst${i}@example.com`)
      expect(response.status).toBe(200)
    }
    const sixth = await requestMagicLink(auth, 'burst5@example.com')
    expect(sixth.status).toBe(429)

    const rateLimitRows = await ctx.db.prepare('SELECT key, count FROM rateLimit').all<{ key: string; count: number }>()
    expect(rateLimitRows.results.length).toBeGreaterThan(0)

    const restartedAuth = createAuth(ctx.db, ctx.env)
    const afterRestart = await requestMagicLink(restartedAuth, 'burst6@example.com')
    expect(afterRestart.status).toBe(429)
  })
})
