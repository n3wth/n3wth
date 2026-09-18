import { betterAuth, type D1Database as BetterAuthD1Database } from 'better-auth'
import { magicLink } from 'better-auth/plugins'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { D1Database, SkillsEnv } from '../db/d1'
import { resolveAuthConfig, type SkillsAuthEnv } from './config'
import { sendMagicLinkEmail } from '../email/magic-link'

export type SkillsWorkerEnv = SkillsEnv & SkillsAuthEnv

/**
 * Better Auth instance bound to the worker's D1 database.
 *
 * - Native D1 binding: better-auth 1.7.5 duck-types the D1 binding
 *   (prepare/batch/exec) and drives it through its own Kysely D1 dialect.
 *   Schema lives in apps/skills/migrations/0001_better_auth.sql.
 * - Single-use magic links via the magic-link plugin: tokens are stored in
 *   the `verification` table and consumed atomically on first redemption,
 *   so replay rejection is durable in D1 across requests and restarts.
 * - Durable rate limiting: storage "database" persists counters in the
 *   `rateLimit` table instead of per-isolate memory.
 * - Origin checks: trustedOrigins gates callbackURL/redirect validation and
 *   cross-origin requests; anything not listed is rejected.
 */
export function createAuth(db: D1Database, env: SkillsAuthEnv) {
  const config = resolveAuthConfig(env)
  return betterAuth({
    appName: 'n3wth-skills',
    secret: config.secret,
    baseURL: config.baseURL,
    trustedOrigins: config.trustedOrigins,
    database: db as unknown as BetterAuthD1Database,
    emailAndPassword: { enabled: false },
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url, token }) => {
          await sendMagicLinkEmail(env, { to: email, url, token })
        },
      }),
    ],
    rateLimit: {
      enabled: true,
      storage: 'database',
      window: 10,
      max: 100,
    },
    advanced: {
      // Never skip origin checks: the default behavior skips them when
      // NODE_ENV === 'test', which made the local validation suite unable to
      // exercise hostile-origin rejection. Explicit false keeps the check on
      // in every environment.
      disableOriginCheck: false,
      // Cloudflare sits in front of the worker; trust its client-IP header
      // first so rate limiting keys on the real client, not the edge.
      ipAddress: { ipAddressHeaders: ['cf-connecting-ip', 'x-forwarded-for'] },
    },
  })
}

export type Auth = ReturnType<typeof createAuth>

// One auth instance per D1 binding per isolate.
const authCache = new WeakMap<D1Database, Auth>()

export function getAuth(db: D1Database, env: SkillsAuthEnv): Auth {
  const cached = authCache.get(db)
  if (cached) return cached
  const auth = createAuth(db, env)
  authCache.set(db, auth)
  return auth
}

/** Resolve the worker env (Cloudflare context first, process.env fallback). */
export async function getWorkerEnv(): Promise<SkillsWorkerEnv> {
  try {
    const { env } = await getCloudflareContext({ async: true })
    return env as SkillsWorkerEnv
  } catch {
    // Outside a Cloudflare context (plain `next dev`, tests)
    return process.env as unknown as SkillsWorkerEnv
  }
}

/** Current session for a request, or null. Throws if DB/secret missing. */
export async function getSessionFromHeaders(headers: Headers) {
  const env = await getWorkerEnv()
  const db = env.DB
  if (!db) return null
  const auth = getAuth(db, env)
  return auth.api.getSession({ headers })
}
