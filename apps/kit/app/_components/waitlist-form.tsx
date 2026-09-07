'use client'

import { useState, type FormEvent } from 'react'
import posthog from 'posthog-js'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface WaitlistFormProps {
  variant?: 'inline' | 'compact'
  className?: string
}

export function WaitlistForm({ variant = 'inline', className = '' }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState('error')
      setErrorMessage('Enter a valid email address')
      return
    }

    setState('submitting')
    setErrorMessage('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) throw new Error('Request failed')

      const data = await res.json()
      if (data.success) {
        setState('success')
        setEmail('')
        posthog.capture('waitlist_signup', { email })
      } else {
        throw new Error(data.error || 'Something went wrong')
      }
    } catch (err) {
      setState('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong. Try again.'
      )
    }
  }

  if (state === 'success') {
    return (
      <div className={className}>
        <p className="text-sm text-emerald-600">You&apos;re on the list. We&apos;ll be in touch.</p>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col gap-2 ${className}`}>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (state === 'error') setState('idle')
            }}
            placeholder="you@company.com"
            className="flex-1 rounded-lg border border-rail bg-bg-soft px-3 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-rail-strong focus:outline-none"
          />
          <button
            type="submit"
            disabled={state === 'submitting'}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {state === 'submitting' ? '...' : 'Notify me'}
          </button>
        </div>
        {state === 'error' && (
          <p className="text-xs text-red-600">{errorMessage}</p>
        )}
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (state === 'error') setState('idle')
          }}
          placeholder="you@company.com"
          className="flex-1 rounded-lg border border-rail bg-bg-soft px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-rail-strong focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === 'submitting' ? 'Joining...' : 'Join the waitlist'}
        </button>
      </div>
      {state === 'error' && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}
    </form>
  )
}
