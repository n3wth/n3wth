import { NextResponse } from 'next/server'

/**
 * GET /api/health/supabase
 * Legacy diagnostic for the retained Supabase source, not current app health.
 * Verifies the connection and migrations (upvotes, comments, profiles).
 * Safe to call from production — returns status only, no secrets.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SKILLS_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SKILLS_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return NextResponse.json(
      { ok: false, error: 'Supabase not configured', tables: {} },
      { status: 503 }
    )
  }

  const tables: Record<string, { ok: boolean; error?: string }> = {}

  await Promise.all(['upvotes', 'comments', 'profiles'].map(async table => {
    try {
      const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${table}?select=id&limit=1`, {
        method: 'HEAD',
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        signal: AbortSignal.timeout(5000),
      })
      tables[table] = response.ok ? { ok: true } : { ok: false, error: `HTTP ${response.status}` }
    } catch {
      tables[table] = { ok: false, error: 'Connection failed' }
    }
  }))

  const allOk = Object.values(tables).every((t) => t.ok)

  return NextResponse.json(
    {
      ok: allOk,
      tables,
    },
    { status: allOk ? 200 : 503 }
  )
}
