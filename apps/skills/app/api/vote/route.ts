import { NextRequest, NextResponse } from 'next/server'
import { getCommunityContext } from '@/src/server/auth/auth'
import { votesDelete, votesGet, votesPost } from '@/src/server/handlers/votes'

/** GET /api/vote?skillId=x - returns { count } (D1 + legacy Neon fallback) */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const skillId = searchParams.get('skillId')
  if (!skillId) {
    return NextResponse.json({ error: 'skillId required' }, { status: 400 })
  }
  return votesGet(skillId, await getCommunityContext())
}

/** POST /api/vote - add vote. Auth session -> own upvote; anon -> fingerprint */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const skillId = searchParams.get('skillId')
  if (!skillId) {
    return NextResponse.json({ error: 'skillId required' }, { status: 400 })
  }
  return votesPost(skillId, request, await getCommunityContext())
}

/** DELETE /api/vote - remove own vote (session) or anon fingerprint vote */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const skillId = searchParams.get('skillId')
  if (!skillId) {
    return NextResponse.json({ error: 'skillId required' }, { status: 400 })
  }
  return votesDelete(skillId, request, await getCommunityContext())
}
