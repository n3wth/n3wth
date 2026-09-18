'use client'

import { createAuthClient } from 'better-auth/react'
import { magicLinkClient } from 'better-auth/client/plugins'

/**
 * Better Auth browser client for the Skills D1 auth backend.
 *
 * Talks to /api/auth/* served by app/api/auth/[...all]/route.ts. Intentionally
 * standalone for now — the existing Supabase-backed AuthProvider is replaced
 * in a follow-up change.
 */
export const authClient = createAuthClient({
  plugins: [magicLinkClient()],
})

export type SkillsAuthClient = typeof authClient
