import { getCloudflareContext } from '@opennextjs/cloudflare'

export interface D1Result {
  success?: boolean
  meta?: { changes?: number }
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = Record<string, unknown>>(column?: string): Promise<T | null>
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
  run(): Promise<D1Result>
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<Array<{ results?: T[]; meta?: { changes?: number } }>>
}

interface SkillsCloudflareEnv {
  DB?: D1Database
}

export async function getDatabase(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true })
  const database = (env as SkillsCloudflareEnv).DB
  if (!database) {
    throw new Error('D1 database binding DB is not configured')
  }
  return database
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function newId(): string {
  return crypto.randomUUID()
}
