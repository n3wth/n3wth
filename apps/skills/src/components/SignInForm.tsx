'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'

interface SignInFormProps {
  className?: string
}

/**
 * Magic-link sign-in form backed by the Better Auth client:
 * email input → signIn.magicLink → "check your email" confirmation state.
 */
export function SignInForm({ className = '' }: SignInFormProps) {
  const { signIn, error } = useAuth()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    try {
      await signIn(email.trim())
      setSent(true)
    } catch {
      // signIn errors surface via useAuth().error below
    } finally {
      setSending(false)
    }
  }

  if (sent && !error) {
    return (
      <p className={`text-sm ${className}`} style={{ color: 'var(--color-grey-400)' }}>
        Check your email for a magic link to finish signing in.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        className="w-full px-4 py-3 rounded-lg text-sm mb-3"
        style={{
          backgroundColor: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          color: 'var(--color-white)',
        }}
      />
      <button
        type="submit"
        disabled={!email.trim() || sending}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
        style={{
          backgroundColor: 'var(--glass-highlight)',
          border: '1px solid var(--glass-border)',
          color: 'var(--color-white)',
        }}
      >
        {sending ? 'Sending...' : 'Email me a sign-in link'}
      </button>
      {error && (
        <p className="text-sm text-red-400 mt-3">{error}</p>
      )}
    </form>
  )
}
