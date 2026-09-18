import type { D1Database } from '../db/d1'
import { nowIso } from '../db/d1'

export type AnalyticsEvent = 'view' | 'copy'

export interface AnalyticsSummary {
  skill_id: string
  views: number
  copies: number
}

export interface QuotaResult {
  allowed: boolean
  used: number
  remaining: number
  limit: number
}

export async function recordAnalytics(db: D1Database, skillId: string, eventType: AnalyticsEvent): Promise<void> {
  await db.prepare('INSERT INTO analytics (skill_id, event_type, created_at) VALUES (?, ?, ?)').bind(skillId, eventType, nowIso()).run()
}

export async function getAnalyticsSummary(db: D1Database, skillId: string): Promise<AnalyticsSummary> {
  const row = await db.prepare(
    `SELECT skill_id, SUM(event_type = 'view') AS views, SUM(event_type = 'copy') AS copies
      FROM analytics WHERE skill_id = ? GROUP BY skill_id`
  ).bind(skillId).first<{ skill_id: string; views: number | string; copies: number | string }>()
  return { skill_id: skillId, views: Number(row?.views ?? 0), copies: Number(row?.copies ?? 0) }
}

export async function getAnalytics(db: D1Database, skillId?: string): Promise<AnalyticsSummary[]> {
  const statement = skillId
    ? db.prepare(`SELECT skill_id, SUM(event_type = 'view') AS views, SUM(event_type = 'copy') AS copies FROM analytics WHERE skill_id = ? GROUP BY skill_id`).bind(skillId)
    : db.prepare(`SELECT skill_id, SUM(event_type = 'view') AS views, SUM(event_type = 'copy') AS copies FROM analytics GROUP BY skill_id ORDER BY copies DESC`)
  const { results } = await statement.all<{ skill_id: string; views: number | string; copies: number | string }>()
  return results.map(row => ({ skill_id: row.skill_id, views: Number(row.views), copies: Number(row.copies) }))
}

async function consumeQuota(db: D1Database, table: 'playground_usage' | 'workflow_usage', fingerprint: string, limit: number): Promise<QuotaResult> {
  const timestamp = nowIso()
  const results = await db.batch([
    db.prepare(`
      INSERT INTO ${table} (fingerprint, created_at)
      SELECT ?, ? WHERE (SELECT COUNT(*) FROM ${table} WHERE fingerprint = ?) < ?
    `).bind(fingerprint, timestamp, fingerprint, limit),
    db.prepare(`SELECT COUNT(*) AS used FROM ${table} WHERE fingerprint = ?`).bind(fingerprint),
  ])
  const used = Number(results[1]?.results?.[0]?.used ?? 0)
  return { allowed: Boolean(results[0]?.meta?.changes), used, remaining: Math.max(0, limit - used), limit }
}

export function consumePlaygroundQuota(db: D1Database, fingerprint: string, limit = 3): Promise<QuotaResult> {
  return consumeQuota(db, 'playground_usage', fingerprint, limit)
}

export function consumeWorkflowQuota(db: D1Database, fingerprint: string, limit = 3): Promise<QuotaResult> {
  return consumeQuota(db, 'workflow_usage', fingerprint, limit)
}
