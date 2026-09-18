import { getCloudflareContext } from '@opennextjs/cloudflare'

/**
 * Apps-side view of the Cloudflare D1 binding.
 *
 * Convention for all Skills D1 code:
 * - Timestamps are ISO 8601 TEXT (`nowIso()`), matching the better-auth D1
 *   dialect which writes `Date` values via `toISOString()`.
 * - Booleans are INTEGER 0/1 (the adapter handles this for its own tables).
 * - JSON payloads, if ever needed, go in TEXT columns with explicit
 *   `JSON.parse`/`JSON.stringify` at the repository boundary — never rely on
 *   implicit driver conversion.
 */
export interface D1ResultMeta {
  changes?: number
  last_row_id?: number
  duration?: number
}

export interface D1Result {
  success?: boolean
  meta?: D1ResultMeta
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = Record<string, unknown>>(column?: string): Promise<T | null>
  all<T = Record<string, unknown>>(): Promise<{ results: T[]; meta?: D1ResultMeta }>
  run(): Promise<D1Result>
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<Array<{ results?: T[]; meta?: D1ResultMeta }>>
  exec(query: string): Promise<unknown>
}

export interface SkillsEnv {
  DB?: D1Database
}

export async function getDatabase(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true })
  const database = (env as SkillsEnv).DB
  if (!database) {
    throw new Error('D1 database binding DB is not configured')
  }
  return database
}

/** Non-throwing variant for routes with anonymous/no-db fallbacks. */
export async function tryGetDatabase(): Promise<D1Database | null> {
  try {
    return await getDatabase()
  } catch {
    return null
  }
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function newId(): string {
  return crypto.randomUUID()
}
