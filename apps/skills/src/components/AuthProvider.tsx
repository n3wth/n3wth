'use client'

import { createContext, useContext, useCallback, useState, type ReactNode } from 'react'
import { authClient } from '../lib/auth-client'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  github_url: string | null
  twitter_url: string | null
  website_url: string | null
  reputation: number
  streak: number
  role: 'user' | 'maker' | 'admin'
  created_at: string
  updated_at: string
}

type SessionHookResult = ReturnType<typeof authClient.useSession>
type SessionData = NonNullable<SessionHookResult['data']>
export type User = SessionData['user']

export interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  signIn: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

/**
 * Better Auth-backed provider. Replaces the legacy Supabase provider with the
 * same consumption surface; `useSession` (better-auth/react) keeps session
 * state in sync across signOut/auth changes, so no manual subscription is
 * needed. `profile` stays null: the D1 profiles table is read server-side
 * (comments/votes handlers derive identity from the session), and no profile
 * UI consumes it client-side.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, error: sessionError } = authClient.useSession()
  const [error, setError] = useState<string | null>(null)

  const signIn = useCallback(async (email: string) => {
    setError(null)
    const { error: signInError } = await authClient.signIn.magicLink({
      email,
      callbackURL: '/',
    })
    if (signInError) {
      console.error('Sign in error:', signInError.message)
      setError(signInError.message ?? 'Sign in failed')
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    const { error: signOutError } = await authClient.signOut()
    if (signOutError) {
      console.error('Sign out error:', signOutError.message)
      setError(signOutError.message ?? 'Sign out failed')
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        profile: null,
        loading: isPending,
        error: error ?? sessionError?.message ?? null,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
