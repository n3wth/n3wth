/**
 * Environment shape the Skills worker needs for D1 + Better Auth.
 *
 * Secrets are read from Cloudflare bindings (`env` object off the Cloudflare
 * context) with `process.env` as a fallback for local/dev tooling. No secret
 * values live in this repo; set them as Workers secrets / vars:
 *
 *   BETTER_AUTH_SECRET   - required. random 32+ byte secret (wrangler secret put)
 *   BETTER_AUTH_URL      - required. canonical base URL, e.g. https://skills.newth.ai
 *   TRUSTED_ORIGINS      - optional. comma-separated extra origins for auth
 *                          callbacks/CORS beyond the BETTER_AUTH_URL origin
 *   RESEND_API_KEY       - optional magic-link sender (see open question in
 *                          apps/skills/MIGRATION-d1.md)
 *   MAGIC_LINK_FROM      - optional From: address for magic-link email
 *   MAGIC_LINK_OUTBOX    - "1" captures magic links in an in-memory outbox
 *                          instead of sending (local validation only)
 */

export interface SkillsAuthEnv {
  BETTER_AUTH_SECRET?: string
  BETTER_AUTH_URL?: string
  TRUSTED_ORIGINS?: string
  RESEND_API_KEY?: string
  MAGIC_LINK_FROM?: string
  MAGIC_LINK_OUTBOX?: string
}

export interface ResolvedAuthConfig {
  secret: string
  baseURL: string | undefined
  trustedOrigins: string[]
  defaultOrigin: string
}

function readEnv(key: keyof SkillsAuthEnv, env: SkillsAuthEnv): string | undefined {
  const fromBinding = env[key]
  if (typeof fromBinding === 'string' && fromBinding.length > 0) return fromBinding
  const fromProcess = typeof process !== 'undefined' ? process.env?.[key] : undefined
  return fromProcess && fromProcess.length > 0 ? fromProcess : undefined
}

function toOrigin(url: string): string | null {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

/** Resolve Better Auth config from worker bindings. Throws if the secret is missing. */
export function resolveAuthConfig(env: SkillsAuthEnv): ResolvedAuthConfig {
  const secret = readEnv('BETTER_AUTH_SECRET', env)
  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET is not configured')
  }
  const baseURL = readEnv('BETTER_AUTH_URL', env)
  const origins = new Set<string>()
  const baseOrigin = baseURL ? toOrigin(baseURL) : null
  if (baseOrigin) origins.add(baseOrigin)
  const extra = readEnv('TRUSTED_ORIGINS', env)
  if (extra) {
    for (const candidate of extra.split(',')) {
      const origin = toOrigin(candidate.trim())
      if (origin) origins.add(origin)
    }
  }
  if (origins.size === 0) {
    // Local dev fallback only: allows localhost callbacks when no URL is set.
    origins.add('http://localhost:3000')
  }
  const defaultOrigin = baseOrigin ?? 'http://localhost:3000'
  return {
    secret,
    baseURL,
    trustedOrigins: [...origins],
    defaultOrigin,
  }
}
